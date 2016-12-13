import {Injectable} from "@angular/core";
import {Http, Response, Headers} from "@angular/http";
import { Observable} from 'rxjs/Observable';

//recriture du provider pour fonctionner avec le module de generation de 
//formulaire...
import {DynaForm} from "../dyna-forms/forms/dyna.form";


const ENDPOINT = "/wp-admin/admin-ajax.php?action=init_webservice";
//ex d'url: wp-admin/admin-ajax.php?action=init_webservice&marchandise=voiture&motif=achat_vente&current=modedetransport.voiture_frm
@Injectable()
export class DevisProvider {

    //form_infos:any = [];//par defaut, aucune infos a affiche  @DEPRECATED
    //_cache:any;//les infos du localstorage de la session precedente

    _navigation = [];//l'historique de navigation dans ce formulaire
    //pour chaque entrée:
    //    url: l'url du formulaire
    //    group: le nom du group pour le formulaire (global, vehicule, ....)
    //    form: le nom du formulaire (form_marchandise, form_motif,....)
    
    constructor(private _http:Http){
        //tente, pour le fun de recuperer le state de la page
        //Note: du fait de la gestion de l'url par angular, on reload d'une page, va faire un replaceState sur l'historique
        //mais ne garde pas les données precedement enregistrées (etrangement, c'est peut etre juste un oubli ou un bug??)
        //pour pouvoir les recuperer, je la demande avant que le router n'ai le temps de faire quelquechose.... 
        this._history_state = window.history.state;
        console.log("last visit:");
        console.log(this._history_state);
    }

    
    //les données du formulaire, regoupes en sous groupe a chaque fois
    //chaque groupe correspond a un element du workflow
    //a la rigueur, on peut eviter de le mettre en dur et le faire generer par le title du formulaire (ou
    //le name, ou id...)
    devis_infos = {};
    current_key : string = null;//la clé du formulaire actuellement affiché

    last_visited_url_LS = null;//la derniere url de formulaire visitée, provennant du localstorage
    _history_state: string  = null;//uniquemnt utile en cas de reload de page: indique l'URL a obtenir pour charger le formulaire courant

    //renvoie les informations du devis
    //debug only, on verra a faire plus precis plus tard...
    get_devis(){
        return this.devis_infos;
    }

    //enregistre les données du LS dans un cache
    //permet d'enregistrer uniqument les informations pertinentes dans le LS 
    //et diminuer la taille des données 
    //le surcoup au load et unload semble negligeable ici (peut de données)
    //mais garder un oeil dessus
    set_devis_from_localstorage(devis){
        this.devis_infos = devis;//NOTE/ unqiuement les données en cache
    }

    //remet simplement le devis a zero
    create_new_devis(){
        //ce serait bien de garder les données si besoin?
        this.devis_infos = {};
        
    }

    /**
     * renvoie le descripteur de formulaire associé a l'url
     * appellé lors du chargment de la page.
     */
    get_form_descriptor (group:string, form:string){
        //3 cas:
        //    a: vient de la page precedente, donc a toutes les données du formulaire deja en memoire => affiche simplement
        //    b: vient de l'historique: doit avoir l'url pour charger le formulaire en memoire
        //    c: vient de n'importe ou: doit avoir l'url du formulaire dans le LS

        
                //cherche si a deja les données du formulaire
            //attention: savoir si toujours valide?????
            let key =form; //clé du formulaire, unqieument le nom du focrmulaire

            // console.log("recherche formulaire: "+key);


            let fi = null;
            //recherche dans les formulaires deja chargés...
            if(this.devis_infos[key]){
           
                    fi = this.devis_infos[key];
                    if(fi["key"]){
                         //sauvegarde l'URL dans l'history 
                        window.history.replaceState(fi['url'],'a title');//ajoute juste l'url demandé au state....
                        this.last_visited_url_LS = fi["url"];//...et dans le LS
                        // console.log(fi);
                        return Promise.resolve(fi);//renvoie le formulaire 

                    }
                    
            }
            // console.log("pas de formulaire connu... cherche ailleurs...");
            //pas de formulaire en memoire, regarde les données d'URL 
            //d'abord l'etat actuel, sinon celui chargé au load et sinon, celui du localStorage
            let url = window.history.state || this._history_state || this.last_visited_url_LS;
            // console.log(window.history.state);
            // console.log(this._history_state);
            // console.log(this.last_visited_url_LS);
            

            if (url!="undefined"){
                // console.log("charge depuis une url");
                // console.log(url);


                //page avec une navigation, recharge le formulaire 
                return this.load_form_datas_async(null,null,url);//.then( (dt)=>{
                    //recupere les données du formulaire telechargées ET pre-remplie si possible

                    // let key =dt["form"];// dt["group"]+"/"+dt["form"];

                    // let fi = null;
                    // //recherche dans les formulaires deja chargés...
                    // for (let f of Object.keys(this.devis_infos)){

                    //     if(f == key){
                    //         //le formulaire est present, on le renvoie 
                    //         //NOTE: verifier si encore valide????
                    //          fi = this.devis_infos[f];
                            
                    //         return fi;
                            
                    //     }
                    // }
                    // //si ici, probleme 
                    // //je prefererai avoir un reject...
                    // throw ("Unknown formulaire");

                    
                //});
            }
            //si ici, tout est inconnu, rejette la demande 
            return Promise.reject("Unknown form asked!!!");
        
    
    }

    /**
     * passe a la prochaine partie du workflow,
     * lance le chargement sur le serveur
     * 
     * ?? en fin de process, passe a la page de resultat.
     * @param form: le nom du formulaire a recuperer...
     * @return l'url pour affichage de la prochaine page
     */
    next(group?:string,form?:string){
        let key = group+"/"+form;
        //enregistre les clés au cas ou
        // this.last_visited_url = {
        //     "group":group,
        //     "form":form
        // }
        
        //si deja connu 
        if(key && this.devis_infos[key] && this.devis_infos[key]["key"]){
            //formulaire deja chargé, deja populaté, renvoie 
            return Promise.resolve({"group":group,"form":form});//renvoie la route a suivre
        } else {
            //doit charger la description du formulaire 
            return this.load_next_page_url_async(group,form);
        }

        
        
    }

    /**
     * charge la prochaine partie du workflow, probleme, on espere que ce sera toujours pareil....
     * @param form: le nom du formulaire a charger (ex: marchandises, coordonnees....)
     * 
     * @return Promise<DynaForm>: le formulaire a afficher coté client
     */
    load_form_datas_async (group:string="",form:string="", endpoint?:string){
        
        //genere l'url de endpoint 
        let url = endpoint  ? endpoint :    ENDPOINT + this.create_url(group,form);  
        

        return this._http.get(url)
        .toPromise()
        .then( (res:Response)=>{
            //charge les infos depuis le serveur, par defaut, lance le premier etat de navigation
            
            
            let fi = res.json();//les données recuperer du serveur
            if(fi["key"] === undefined){
                //redirige appli vers resultats
                this.current_key = null;//au cas ou...
                return null;
            }

            //la clé complete du formulaire
            this.current_key = fi.key;
            let form_name:string  = this.current_key.split("/")[1];//just le nom
            fi["url"]  =  url; //sauvegarde l'url du formulaire demandé en cas de retour via l'historique de navigation du
            //navigateur

            //populate datas a partir du cache de données
            if(this.devis_infos[form_name]){

                //NOTE: DOIT VERIFIER SI LE FORMULAIRE et LES DONNEES SONT ENCORE VALIDES OU PAS
                //peut: verifier URL, verifier si group==global,...
                if (group=="global" || url != this.devis_infos[form_name].url){
                    //le formulaire semble different....
                    console.log("Le formulaire semble different, ne repopulate pas...");
                } else {

                    //meme url et parametres, accepte le cache

                    //valeur en cache 
                    //doit recup les valeurs avant de mettre en place
                    let cache = this.devis_infos[form_name].fields;
                    let total = fi.fields.length; 
                    for (let i=0;i<total;i++){
                        fi.fields[i]['value'] = cache[i]['value'];//enregistre le cache
                    }
                }

            }
            this.devis_infos[form_name] = fi;//enregistre avec la clé/nom du formulaire 
            
            //NOTE: pas besoin de mettre les infos dans l'history ou le LS:
            //soit elles y sont deja (vient avec BACK/PREC ou chargement du LS)
            //soit la methode est appellée avant le changement d'URL (dyn.forms.component.next()) 
            //et les données seront enregistrées apres...

            return fi;//retourne juste le formulaire

        })

    }

    load_next_page_url_async(group:string="",form:string="", endpoint?:string){
        return this.load_form_datas_async(group,form).then( (fi)=>{
            console.log(fi);
            if(!fi) return null;//pas de données


            //si locastorage, populate le formulaire 
            // console.log("Localstorage????");
            // if (this._cache){
            //     let form_name:string  = fi["key"].split("/")[1];//just ele nom
            //     let form = this._cache[form_name];
                
            //     // console.log(form);
            //     if (form){
            //         // console.log("formulaire deja rempli!!! repopulate");
            //         for (let field of fi.fields){
                        
            //             let v = form[field["id"]];
            //             if(v) field["value"] = v.value;//peut avoir d'autres données possiblement
            //         }
            //     }
            // }


            let k = this.current_key.split('/');

            //si tout bon, retourne les infos d'url 
            return {
                "group":k[0],
                "form":k[1]
            };


        });
    }
    /**
     * charge les informations du devis gneres via l'application
     * END OF WORK 
     */
    load_devis_details_async(){
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        //recupere les données du formulaire pour envoie au webservice 
        let details = {};
        
        for (let key of Object.keys(this.devis_infos)){
            
            let form = this.devis_infos[key];
            if(form.fields == null) continue;


            let form_fields = {};

            let field_count = 0;
            let field_id = "";


            for (let field of form.fields){
                
                form_fields[field.id] = field.value;
                field_count ++;
                field_id = field.id;
            }

            if(field_count > 1){
                
                details[key] = form_fields;
            } else {
                //un seul field dans le formulaire, renvoie directement la valeur 
                
                details[key] = form_fields[field_id];
            }

        }


        let cred = "action=generate_quote&app_datas="+JSON.stringify(details);

        return this._http.post("/wp-admin/admin-ajax.php", cred,{
            headers:headers
        })
        .toPromise()
        .then( (res:Response)=>{
            return res.json();
        });
    }

    //une methode bien pourrie pour l'instant...
    /**
     * genere une url avec les données necessaires pour recuperer le prochain formulaire
     * note: la logique voudrait que je ne lui passe QUE le nom du formulaire courant,
     * mais les besoins de l'application m'oblige a assumer une partie des données
     * 
     * si tu a besoin de reprendre le code de l'appli pour autre chose, pense a modifier ca...
     */
    create_url(group:string,form:string):string{
        
         //formulaire courant
        if (form === "") return "";//demande a charger le premier formulaire

        let request = "&current="+group+"/"+form;
        //si a le type de marchandise 
        //recup les 4 premiers fields comme parametres d'application
        
        //note si proviennent du cache, pas le meme chemin....
        request += this.devis_infos["form_marchandise"] ? "&marchandise="+this.devis_infos["form_marchandise"].fields[0].value : "";
        request += this.devis_infos["form_from"] ? "&from="+this.devis_infos["form_from"].fields[0].value : "";
        request += this.devis_infos["form_to"] ? "&to="+this.devis_infos["form_to"].fields[0].value : "";
        request += this.devis_infos["form_motif"] ? "&motif="+this.devis_infos["form_motif"].fields[0].value : "";
     
        console.log(request);
        //construit l'url 
        return request;

    }


    load_from_LS(){
        //recupere les dernieres données via le localstorage 
        if(window.localStorage){
            // this._devis.last_visited_url = window.localStorage.getItem("last_form_url");
            this.last_visited_url_LS = window.localStorage.getItem("last_url");
            let devis = JSON.parse(window.localStorage.getItem("app_datas"));
            if(devis){
                //donne au provider 
                this.set_devis_from_localstorage(devis);
               
            }
        }
    }
    save_to_LS(){
        //sauvegarde l'etat de l'application dans le LS
         if(window.localStorage){
            let devis = this.get_devis();//recup le devis courant 
            // let url = this._devis.last_visited_url;//la derniere URL sauvegardée 
            window.localStorage.setItem("last_url",this.last_visited_url_LS);

            //tranforme les données du formulaire en quelquechose de plus digeste pour sauvegarde locale 
            //si a deja un cache, garde les données

        
           window.localStorage.setItem("app_datas",JSON.stringify(this.compact_datas(this.devis_infos)) );//pour l'instant, sauvegarde tout comme un porc...
        }
    }

    /**
     * Afin de sauvegarder le maximum de place sur l'appareil de l'utilisateur,
     * on compacte les données pour ne sauvegarder que l'essentiel
     */
    private compact_datas(devis){
        let dt = {};
            for (let frm of Object.keys(devis)){
                let fds = [];
                let fields = devis[frm].fields;
                if(fields == null ) continue;

                let url = devis[frm].url;//url pour recup les données
                for (let field of fields){

                    fds.push({
                        "value":field["value"],
                        "id": field["id"]
                        //voir si autre chose?????
                    });
                }
                dt[frm] = {
                    "fields":fds,//pour les differents champs du formulaire 
                    "url":url
                };

            }
        return dt;
    }


    //sauvegarde le devis en local (DB), uniquement les données du devis...
    save_current_devis(){
        return this.open_DB().then ( (db)=>{
            return this.save_to_sgbd(db, this.devis_infos);
        });
    }
    //pour savoit si on a acces a une BDD sur la machine
    has_IDB(){return window.indexedDB!=null; }
    private open_DB(){

        return new Promise( (resolve, reject)=>{
        let db;
         let request = window.indexedDB.open("expedom", 1);
         
         request.onerror = function(event) {
            reject("error: ");
         };
         
         request.onsuccess = function(event) {
            db = request.result;
            resolve(db);
         };
         
         request.onupgradeneeded = function(event) {
            var db = event.target["result"];
            var objectStore = db.createObjectStore("devis", {keyPath: "id"});
            
         }
        });
        
    }

    
    private save_to_sgbd(db, devis){
        return new Promise ( (resolve, reject)=>{

           
                if (this.has_IDB()) {
                    //OK
                    let dt = this.compact_datas(devis);
                    dt["date"]=Date.now();
                    dt["sgbd_title"]="voir a gnerer un titre explicite....";
                    let save_data = {
                        "id" : dt["date"],
                        "v":dt
                    }
                   
                    
                    let request = db.transaction(["devis"], "readwrite")
                    .objectStore("devis")
                    .add(save_data);
                    
                    request.onsuccess = function(event) {
                        console.log("success de l'enregistrement");
                        resolve(true);
                    };
                    
                    request.onerror = function(event) {
                        console.log("une couille");
                        reject("Erreur enregistrement");
                    }
            } else {
                //pas de sauvegarde possible...
                reject("Impossible de creer une DB sur cette machine...");
            }
        });
        
            
    }
   

    //recupere tous les devis precedement sauvegardés
    get_all_saved_devis(){
        return this.open_DB().then( (db)=>{
            return this.read_all(db);
        });
            
    }
    private read_all(db){
        return new Promise( (resolve, reject)=>{
            let objectStore = db.transaction("devis").objectStore("devis");
            let results = [];

            
            let cursor = objectStore.openCursor();
            cursor.onerror = function (event){ reject(event); }
            cursor.onsuccess = function(event) {
               var cursor = event.target.result;
               
               if (cursor) {
                   results.push(cursor.value.v);
                   cursor.continue();
               }
               
               else {
                  resolve(results);
               }
            };
        
        });
    }
//@DEPRECATED: parse les données de l'ancien webservice pour les mettre dans
// une forme un peu plus comprehensible pour moi......
//je garde pour raison historique.



    /**
     * parse le json recuperer par le webservice et met le dans une forme plus
     * acceptable pour une generation dynamique
     * vu les json, j'ai pas fini de galerer....
     * @param key: le nom du formulaire 
     * @param datas: l'objet json recuperer par le webservice 
     * 
     * @return un objet DynaForm pret a etre afficher
     
    parse_form_infos (key:string, datas:any){

        console.log(datas);
        this.HACK_PREC(key,datas);


        let form_infos = new DynaForm();
        let inner = datas.acf;//recupere les formulaires 


        


        if (inner[key] === undefined){
            //Peut etre directement l'objet recherché
            //OU se trouver dans un suboptions!!!
            console.log(inner);
            if(inner["subOptions"]){
                //tente une recherche
                let subOpts = inner["subOptions"];
                let subOptions = inner.subOptions;//parfois, il y a des subOptions....


                for(let subOpt of subOpts){
                    if (subOpt.title == key){
                        this._parse_infos(subOpt,form_infos,key,subOptions);
                        break;
                    }
                }
            }
            else{
                //tente direct
                let subOptions = inner.subOptions;//parfois, il y a des subOptions....
                this._parse_infos(inner, form_infos, key,subOptions);
            }
            


        } else {


            let subOptions = inner.subOptions;//parfois, il y a des subOptions....


            //si plusieurs, doit chercher celui qu'il faut 
            if (inner[key].length == 1){

                let dirty = inner[key][0];//acf renvoie toujours un tableau  
                this._parse_infos(dirty, form_infos, key, subOptions);
                
            
            } else {
                //doit chercher celui qu'il faut....
            
                let inner_forms = inner[key];

                let look_for = "marchandise";          // A rendre dynamique!!!!
                let look_field = "marchandise";
                let value = undefined;

                //recupere la valeur de test 
                let cible = this.devis_infos[look_for].questions;
                for (let q of cible){
                    if (q.key == look_field){
                        value = q.value;
                        break;
                    }
                }
                console.log("recherche category:"+value);
                //assume!!! recherche de marchandise 
                for (let inner_form of inner_forms){
                    if (inner_form.category.toUpperCase() == value.toUpperCase()){
                        this._parse_infos(inner_form, form_infos, key,subOptions);
                        break;
                    }
                }


            }


        }
        


        return form_infos;
    }
   

   private _parse_infos(dirty, form_infos, key, subOptions){

            console.log("working on...");
            console.log(dirty);


            form_infos.title = dirty.title;
            form_infos.description = dirty.description;
            


            if (dirty.isSingular == 1){
                console.log("Singular field");
                //ce formulaire ne dispose que d'une seule question, generalement a choix multiple
                let field  = new MultigroupRadioField();//voir si besoin de faire plus general que ca...
                field.key = key;

                let parent = dirty.parent_group;//si doit se referer a quelquechose
                        
                //les groupes de datas, mais peut aussi avoir des precisions, fields, etc....
                if(dirty.group){
                    //represente un ensemble de possibilité reunie en une seule 
                    for (let gr of dirty.group){


                        if(parent){

                            console.log("Workaround transport");

                            let value = undefined;
                            let cible = gr.category;
                            let itemId = gr.itemId;
                            
                            //verifie si bon 
                            let cmp = this.devis_infos[parent.toLowerCase()];
                            
                            //recherche la valeur 
                            for (let c of cmp.questions){
                                
                                if(c.value.toUpperCase() == itemId.toUpperCase()){
                                    value = c.value;
                                    break;
                                }
                            }
                            //si les valeurs ne correspondent pas, degage 
                            if(value === undefined) continue;
                        }

                        
                        let choicegroup = new ChoiceRadioField();
                        choicegroup.title = gr.title;
                        choicegroup.label = gr.label;
                        choicegroup.category = gr.category;
                        choicegroup.items = gr.items;   //////MERCI!
                        // for (let it of gr.items){
                        //     let radio = new Choice();
                        //     radio.name = it.name;
                        //     radio.icon = it.icon;
                        //     radio.label = it.label;

                        //     choicegroup.items.push(radio);
                        // }
                        field.items.push(choicegroup);

                    }
                }
                

                form_infos.questions.push(field);
                this.searchSubOptions(field, subOptions);



            } else {
                //plusieurs champs dans le formulaire
                console.log("plusieurs champs");

                let fields = dirty.group || dirty.fields || dirty.items;
                if(fields){
                    //des choices 
                    //NOTE! suivant le cas, certains champs seront invalides

                    


                    //si un type est precisé                    
                    let field = undefined;
                    for (let gr of fields){
                        

                        if(gr.type){
                            //cree un field suivant le type demandé
                            
                            switch(gr.type){
                                
                                case 'select':{
                                    field = new SelectField();
                                    console.log(gr);
                                    field.items = gr.selection;
                                    break;
                                }
                                default:{
                                    field = new SimpleField(gr.type);
                                }
                                //et les autres cas a mettre en place
                            }
                            

                        } else {

                            //assume un choicegroup radiobutton
                            field = new ChoiceRadioField();                    

                            field.items = gr.items;
                            
                        }

                        field.title = gr.title;
                        field.key = gr.category || gr.name || gr.title;

                        field.category = gr.category;
                        field.label = gr.label;

                        form_infos.questions.push(field);

                        //cherche pour des subOptions???
                        this.searchSubOptions(field, subOptions);
                        
                    }                                        
                }
            }
   }
   private searchSubOptions(field, subOptions){
    //    console.log("looking for suboptions....");
    //    if(subOptions === undefined || subOptions.length == 0) return;
    //    console.log("on a des suboptions!!!");

    //    for (let so of subOptions){
    //        if(so.parent_group.toUpperCase() == field.key.toUpperCase()){
    //            console.log("Un suboption pour ce field!!!");
    //            for(let group of so.group){
    //                let symbol = group.itemId; //la valeur qui declenche l'apparation des sub-options
    //                console.log("recherche valeur: "+symbol);
                   
    //                //cree un field pour celui ci et ajoute aux questions du field...
    //                this._parse_infos(group, field, symbol,subOptions );
    //                //enregistre le nouveau filtre 
    //                field.filtres.push(symbol);
    //            }
    //        }
    //    }
   }

   //Du a des inconsistances dans les données, utilise un gros HACK pour
   //faire fonctionner
   private HACK_PREC(key,dt){
       //reecrit les quelques datas qui posent problemes quand elles se presentent
        //en vrac 
        if(key =="precisions" ){
            console.log("HACK!!!!");
            
            dt.acf.precisions[3].category = "En Vrac";
            dt.acf.precisions[4].category = "sur palette";
            dt.acf.precisions[5].category = "10m3";//probleme, pas de difference entre 10m3 et 20m3 conteneur
        }
        if (key == "marchandise"){
            dt.acf.subOptions = undefined;//supprime
        }
        if (key=="prise en charge"){
            dt.acf = {
                title: "Prise en charge",
                description: "Un gros probleme ici, je comprends pas les données recues....",
                group: []
            }
        }
        /*
        
        
        return dt;
    }
    */

}