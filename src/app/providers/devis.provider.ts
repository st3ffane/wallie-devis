import {Injectable} from "@angular/core";
import {Http, Response, Headers} from "@angular/http";
import { Observable} from 'rxjs/Observable';
import {BehaviorSubject} from "rxjs/BehaviorSubject";

import {TARGET} from "../target";

//recriture du provider pour fonctionner avec le module de generation de 
//formulaire...
import {DynaForm} from "../dyna-forms/forms/dyna.form";


const ENDPOINT = TARGET+"/wp-admin/admin-ajax.php?action=init_webservice";
const RELOAD = TARGET+"/wp-admin/admin-ajax.php?action=edit_quote&quote_id=";
//ex d'url: wp-admin/admin-ajax.php?action=init_webservice&marchandise=voiture&motif=achat_vente&current=modedetransport.voiture_frm
@Injectable()
export class DevisProvider {

    _origine: string ;
    //form_infos:any = [];//par defaut, aucune infos a affiche  @DEPRECATED
    //_cache:any;//les infos du localstorage de la session precedente

    //_navigation = [];//l'historique de navigation dans ce formulaire
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
        //recupere dans l'url le parametre QUOTE_ID si existe 
        let query_string = {};
        let query = window.location.search.substring(1);
        let vars = query.split("&");

        this._origine = "expedom";
        //("recuperation des infos de l'URL")

        for (let i=0;i<vars.length;i++) {
            let pair = vars[i].split("=");
            //(pair)
            if (pair[0].toUpperCase() == 'QUOTE_ID'){
                this._quote_id = pair[1];
            }
            if (pair[0] == 'origine'){
                this._origine = pair[1];
            }
        } 

        //Ajout 5/06/2017 en prévision de déploiement du plugin sur expesud.com
        //recupération du paramètre origine selon nom de domaine du site
        if(window.location.hostname.includes('expesud')){
             this._origine = 'expesud';
        }


        //


        // //("last visit:");
        // //(this._history_state);
    }

    
    //les données du formulaire, regoupes en sous groupe a chaque fois
    //chaque groupe correspond a un element du workflow
    //a la rigueur, on peut eviter de le mettre en dur et le faire generer par le title du formulaire (ou
    //le name, ou id...)
    devis_infos = {};
    infos_Obs = new BehaviorSubject<any>({});
    getFormAsObservable():Observable<any>{return this.infos_Obs.asObservable();}


    _quote_id = null;//si a un quote id dans l'url, recharge sur serveur le cache et file en 1ere page 

    current_key : string = null;//la clé du formulaire actuellement affiché

    last_visited_url_LS = null;//la derniere url de formulaire visitée, provennant du localstorage
    _history_state: string  = null;//uniquemnt utile en cas de reload de page: indique l'URL a obtenir pour charger le formulaire courant



    /*
    NOTE: ca aurait ete tellement plus simple d'enregistrer les 4 datas dans chaque URLS des le depart,
    mais comme a l'origine, le workflow pouvait NE PAS SUIVRE LE MEME CHEMIN, j'ai du passer via les urls.
    Maintenant que tous les workflows suivent le meme chemin, c'est devenu un peu inutile, mais ca 
    demanderait de tout remodifier... Donc je garde ca uniqument pour le load des datas cote serveur.
    */
    _server_url_params={
        "marchandise":null,
        "from":null,
        "to":null,
        "motif":null
    };//les parametres qui entrent en compte pour les requetes de formulaires

    /**
     * GESTION DE L'HISTORIQUE DE L'APPLICATION:                          A TESTER -----------------------------------------------------------------------
     * permet, en rajouttant un bouton "reprendre" en page d'acceuil de revenir
     * dans le dernier etat du formulaire
     */

    _form_historic=[];//historique du formulaire actuel 
    _form_current_historic=null;//le dernier formulaire visité (historic)
    //_current_historic_index = -1;//index de navigation


    /**au startup de la page (formulaire), demande a ajouter une entrée a l'historique du formulaire
     * @param group: le nom du group du formulaire (ex: global, vehicule,...)
     * @param form: le nom du formulaire (ex: form_to, form_motif....)
     * @param url: l'url qui permet de charger le formulaire 
     * @param datas: des données a enregistrer avec l'historique (principalement, les entrées du formulaire courant)
     */
    addToHistoric(group, form, url,name, datas?:any){
        //verifie si n'a pas deja ce nom de formulaire qqpart 
        
       
        let index = 0;
        let founded = false;
        for(let h of this._form_historic) {
            
            if(h["form"] == form){
                founded = true;
                break;
            } 

            else index++;
        }
        //si a qqchose
        if( founded){
            //supprime du tableau 
            
            this._form_historic = this._form_historic.slice(0,index);
            
        }
        //ajoute a l'historique
        if(datas) this._form_historic.push({"group":group,"form":form,"name":name, "url":url,"datas":datas});
        else this._form_historic.push({"group":group,"form":form, "name":name,"url":url});
       
        //this._current_historic_index = this._form_historic.length -1;
    }
    /**
     * Remet l'historique a ZERO 
     * lorsqu'on commence un nouveau devis
     */
    clearHistoric(){
        this._form_historic = [];//vide compleetement l'historique si commence un nouveau formulaire
        //this._current_historic_index = -1;
    }

    /**
     * Si reprends un devis de l'historique, permet de remettre TOUTES les 
     * etapes précedentes dans l'historique du navigateur pour permettre 
     * d'utiliser les boutons 'BACK' et 'NEXT' du navigateur
     * 
     * NOTE: passe directement par les objets javascript et pas par ceux Angular 
     * permet d'eviter que l'application 'navigue' réellement.
     */
    repop_historic(){
        //tentative un peu a la con: recrée tout l"historique du navigateur lors de la derniere utilisation pour permettre le retout
        //en arriere...
        //except: le dernier???
        //return: group et form pour la navigatioin

        
        let total = this._form_historic.length;
        for (let i=0;i<total;i++){
            let h = this._form_historic[i];
            //ajoute une entrée a l'historique: state=url, title: non supporté, url: devis/group/form
            window.history.pushState (h["url"],'',"/devis/"+h['group']+"/"+h['form']);
        } 
        let h = null;
        if(this._form_current_historic){
            //probleme, le dernier a ete pop!!!!
            h = this._form_current_historic;
            // //("dernier formulaire chargé:");
            // //(h);

            //pour le reload
            this.last_visited_url_LS = h["url"];
            //les données de cache....
            this.devis_infos[h["form"]] = h["datas"];
            //remet a zero 
            this._form_current_historic = null;
            //this._current_historic_index = total -1;//index courant
            
        }
        return h;
    }
    public back(){
        //this._current_historic_index --;//1 de moins 
        window.history.back();
    }
    //recupere le titre du formulaire precedent dans l'historique de navigation
    getTitleFromHistoric(group, form){
        if(this._form_historic.length == 0) return "";
        let total = this._form_historic.length;
        let i = 0;
        for ( i = 0; i<total;i++){
            let h = this._form_historic[i];
            if(h.group == group && h.form == form){
                break;
            }
        }
        //si pas de break, renvoie le dernier
        if(i > 0) return this._form_historic[i-1].name;
        return "";
    }

    /**
     * Permet, pour certaines pages (mainpage et resultat du devis) de desactiver l'enregistrement de l'historique 
     * en cache --evite de gros ennuis si l'utilisateur navigue un peu trop
     */
    deactive_historic(){
        //pour desactiver l'historique, il suffit de nullifier la clé du formulaire courant (elle sera automatiquement remise a jour lors
        //du chargement d'un formulaire)
        this.current_key = null;
    }












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
    set_devis_from_localstorage(devis, form_datas?:any){
        this.devis_infos = devis;//NOTE/ unqiuement les données en cache
        //doit repopulate le dernier form a partir du cache...
        if(form_datas){
            // //("repopulate from historical form");
            // //(form_datas);
            let d = this.devis_infos[form_datas.form];
            let h = form_datas.datas;
            if(d){
                for(let field of h.fields){
                    this.setFormValue(d,field);
                    
                }
            }
        }
        
    }
    private setFormValue(form, field){
        if(form[field.id]){            
             form[field.id]=field.value;
             //("check for position in field");
             if(field.position) form[field.id].position = field.position;
        }
    }

    /**
     * Lorsqu'on demarre un nouveau devis, remet l'historique a ZERO, mais 
     * garde en memoire les reponses précedentes pour repopulation des 
     * formulaires au besoin
     */
    create_new_devis(){
        //supprime les données iportantes pour determiner les etapes suivante (pas de cache)
        if(this.devis_infos["form_marchandise"]) delete(this.devis_infos["form_marchandise"]);// garde les données par defaut???
        if(this.devis_infos["form_from"]) delete(this.devis_infos["form_from"])// garde les données par defaut???
        if(this.devis_infos["form_to"])delete(this.devis_infos["form_to"])// garde les données par defaut???
        if(this.devis_infos["form_motif"]) delete(this.devis_infos["form_motif"])// garde les données par defaut???
        
        this._form_historic=[];
    }

    /**
     * Recharge le cache depuis le serveur
     */
    loadCacheFromServer(){
        //supprime l'historique en cours 
        this.clearHistoric();
        this._form_current_historic = null; 


        let url = RELOAD + this._quote_id;
        return this._http.get(url).toPromise().then ( (rep)=>{
            
            
            
            let cache = rep.json();
            if (!cache ) throw "Pas de reponse du serveur.";
            //enregistre le nouveau cache 
            //decompacte les datas....

            this.devis_infos = this.unpack_datas(cache);
            //this.devis_infos = cache.app_datas;
            //pour povoir valider les formulaires et le caache, je dois garder qqpart en meloire les donnes d'url 
            
            this._server_url_params.marchandise = this.get_raw_param("form_marchandise","marchandise");
            this._server_url_params.from = this.get_raw_param("form_from","from");
            this._server_url_params.to = this.get_raw_param("form_to","to");
            this._server_url_params.motif = this.get_raw_param("form_motif","motif");
            return true;

        })

    }

    /**
     * passe a la prochaine partie du workflow,
     * lance le chargement sur le serveur
     * NOTE N'A BESOIN QUE DES INFOS D'URLS
     * 
     * ?? en fin de process, passe a la page de resultat.
     * @param form: le nom du formulaire a recuperer...
     * @return l'url pour affichage de la prochaine page
     */
    next(group?:string,form?:string){

        
        // let key = group+"/"+form;//form actuel !!!!
        // //let url =ENDPOINT + this.create_url(group, form);//verifie l'url que doit afficher (depend des données)
        // let fi = this.devis_infos[form];

        // //si deja connu MAIS pas forcement valide....                                 <== A VOIR !!!!!
        // if(key && this.devis_infos[key] && this.devis_infos[key]["key"]){
        // //if(this.is_form_valid(fi,group,url)){
        //     //formulaire deja chargé, redirige vers la page voulue
        //     return Promise.resolve({"group":group,"form":form});//renvoie la route a suivre
        // } else {
            //doit charger la description du formulaire 
            
            return this.load_next_page_url_async(group,form);
        // }

        
        
    }

    /**
     * renvoie le descripteur de formulaire associé a l'url
     * appellé lors du chargment de la page.
     * Recupere les parametres de l'URL pour savoir quel formulaire afficher
     */
    get_form_descriptor (group:string, form:string){
        //3 cas:
        //    a: vient de la page precedente, donc a toutes les données du formulaire deja en memoire => affiche simplement
        //    b: vient de l'historique: doit avoir l'url pour charger le formulaire en memoire
        //    c: revient par un reload: doit avoir les infos provennant de l'historique

        
                //cherche si a deja les données du formulaire
            //attention: savoir si toujours valide?????
            console.log('get form descriptor ',group,form)
            let key =form; //clé du formulaire, unqieument le nom du focrmulaire

            // //(" get form descriptor");
            let fi = null;
            //recherche dans les formulaires deja chargés...
            //verifie que le groupe correspond aussi
            console.log(this.devis_infos[key]);
            console.log("Verifie historic")
            if(this.devis_infos[key] && this.devis_infos[key]["key"]){
                    
                    
                    fi = this.devis_infos[key];

                    
                    let fi_group = fi.key.split("/")[0];//le groupe
                    // if(group != "server" && fi_group != group){
                    //     //invalide, relance la recharge du formulaire avec group et form
                    //     console.log("groupe differents et non server, charge les données du formulaire") 
                    //     return this.load_form_datas_async(group,form);
                    // }



                    let url = fi.url;

                    console.log("Formulaire deja chargé en memoire, normalement, tout est OK....")
                    console.log("Doit juste verifier que les datas dans le formulaire sont valides....")

                    if(group != "global" //toujours garder le cache d'une form globale
                        && !url.startsWith(this.devis_infos[key].url)){
                            //reinitialise a null toutes les datas
                            // console.log("formulaire invalide, remet a zero")
                            this.reinit_form(key);
                        }// else {
                        //     console.log("formulaire valide, garde les datas....")
                        //     console.log(fi);
                        // }
                    //if(fi["key"]){
                    // //("veridie si datas valides")
                    //if(group == 'global'){

                        // //("form valide, repopulate")
                         //sauvegarde l'URL dans l'history 
                        window.history.replaceState(fi['url'],'a title');//ajoute juste l'url demandé au state....
                        this.last_visited_url_LS = fi["url"];//...et dans le LS
                        // //(fi);
                        //verifie si datas valide: normalement, rien a faire????
                        
                            // //("form global ou connue, repopulate")

                            // //meme url et parametres, accepte le cache
                            // let cache = fi.fields;
                            // let total = fi.fields.length; 
                            // for (let i=0;i<total;i++){
                            //     fi.fields[i]['value'] = cache[i]['value'] || '';//enregistre le cache

                            //     let debug = fi.fields[i];
                            //     // //(debug.id+":"+debug.value);
                            // }
                        
                        // //(fi);
                        //for (let field of fi.fields) field.value = undefined;//remet a null au cas ou les données ne soient pas coherentes
                        

                    // }// else {
                    //     //("euh, la, je sais pas....")
                    // }
                    this.current_key = fi.key; //la clé du formulaire courant
                    // //(fi)
                    return Promise.resolve(fi);//renvoie le formulaire 
                    
            }

            //pas de cache, verifie si demande un group/form 
            // if(group!=null && form!=null){
            //     console.log("groupe et form, charge les données du formulaire") 
            //             return this.load_form_datas_async(group,form);
            // }

            //pas de formulaire en memoire, regarde les données d'URL 
            //d'abord l'etat actuel, sinon celui chargé au load et sinon, celui du localStorage
            //window.history.state: si navigue par bouton Back/prev du navigateur
            //_history_state: si arrive directement sur la page depuis ailleurs???? probleme du a angular qui efface les données d'url 
            //last_visited: si proviens du bouton Reprendre mon ancien formulaire 
            let last = this.devis_infos[key] ? this.devis_infos[key]['url'] : null;
            let url = last || window.history.state || this._history_state || this.last_visited_url_LS ;
           
            
            console.log(url);
            if (url && url!="undefined"){
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

    private reinit_form(form){
        if (this.devis_infos[form] && this.devis_infos[form]["fields"]){
            for (let field of this.devis_infos[form]["fields"]) field.value = null;
        }
    }    

    /**
     * m'indique si le formulaire en memoire est toujours valide,
     * ie meme groupe, meme URL (parametres marchandise, from, to et motif)
     */
    private is_form_valid(form,requestedGroup): boolean{
       
        let request = this.get_param("form_from","from");
        request += this.get_param("form_to",'to');
        request += this.get_param("form_motif","motif");

        return form && form["key"] && (requestedGroup=="global" || form["url"].indexOf(request)!==-1);
    }
    

    /**
     * charge la prochaine partie du workflow
     * si a deja des données en cache et que le cache est valide, recupere les données
     * 
     * @param group, form: le group et form du formulaire actuel (ex: global, form_marchandise)
     * @param endpoint: url du formulaire a charger (si ne proviens pas de next())
     * 
     * @return Promise<DynaForm>: le formulaire a afficher coté client
     */
    load_form_datas_async (group:string="",form:string="", endpoint?:string){
         //genere l'url de endpoint 
        let url = endpoint  ? endpoint :    ENDPOINT + this.create_url(group,form);  
        

       console.log("chargement du formulaire depuis ",url)
        return this._http.get(url)
        .toPromise()
        .then( (res:Response)=>{
            //charge les infos depuis le serveur, par defaut, lance le premier etat de navigation
            
            
            let fi = res.json();//les données recuperer du serveur
            console.log(fi);
            if(fi["key"] === undefined){
                this.current_key = null;//au cas ou...
                
                //si une erreur 
                if(fi["error"]){
                    throw fi['error'];//bug 


                }else {
                    // //("Affichage des resultats");
                    //redirige appli vers resultats
                    
                    return fi;
                }
                
            }

            //la clé complete du formulaire
            this.current_key = fi.key;
            
            //               HACK!!!
            //pour la gestion du switch_details, ajoute le contenu des options 
            //au formulaire, et bind le hidden des inputs au resultat de la radio 
            /*if (question.type=="switch_details"){
                    console.log("un switch details");
                    for (let option of question.options){
                        console.log(option);
                        for (let inner_field of option.fields){
                            console.log(inner_field.id)
                            let ctrl = new FormControl(inner_field.value || '', this.get_validators_for_field(inner_field));
                            group[inner_field.id] = ctrl;
                        }
                    }
                }*/
            console.log("populate form")
            for (let i = 0; i<fi.fields.length; i++){
                let field = fi.fields[i];

                if(field.type == "switch_details"){
                    field.hide = true;//n'affiche pas dans le résumé
                    for (let option of field.options){
                        
                        for (let inner_field of option.fields){
                            i++;
                            //comment lui dire: hide si radio du dessus vaut true ou false???
                            //ajoute au formulaire simplement
                            //cree une copie 
                            // let ifield = JSON.parse(JSON.stringify(inner_field));
                            inner_field.display = "none";//empeche de s'afficher
                            fi.fields.splice(i,0,inner_field);
                            //passe au suivant
                            
                        }
                    }
                }
            }






            //si provient du serveur, je n'ai pas ces infos...

            let cache_key = this.current_key ? this.current_key.split("/") : "";
            let form_name:string  = "";//just le nom
            let group =  "";
            if(cache_key.length == 1){
                //provient du serveur / invalid?
                form_name = fi.key;
                group = "server";

                //la clé complete du formulaire
                this.current_key = "server/"+fi.key;
            } else {
                //cache normal 
                form_name  = cache_key[1];//just le nom
                group = cache_key[0];
            }
            


            // //(form_name)
            fi["url"]  =  url; //sauvegarde l'url du formulaire demandé en cas de retour via l'historique de navigation du
            //navigateur
            console.log("verifie validité formulaire");
            //populate datas a partir du cache de données...
            if(this.devis_infos[form_name]){
                console.log("Données en cache, verifie si valides")
                //(group);

                //valeurs du group de cache 
                let cache_group = this.devis_infos[form_name].key ? this.devis_infos[form_name].key.split("/")[0] : "";
                let cache_form = this.devis_infos[form_name].key ? this.devis_infos[form_name].key.split("/")[1] : "";
                //test repopulate




                //TODO condition pour le repopulate d'apres le cache...
                /*
                les differents cas:
                    - group == global: le formulaire ne change pas => repopulare
                    - group == server: le cache provient du server, SI les parametres n'ont pas changés, repopulate 
                    - group == ??? : cache d'un ancien devis, SI les parametres n'ont pas changés, repopulate, sauf si no_cache
                */
                // console.log("Cache verification:");
                // console.log("group: "+group);
                // console.log("cache_group:"+cache_group);
                // console.log("url: "+url);
                // console.log("form url: "+this.devis_infos[form_name].url);

                if( (group == "global") //formulaire toujours valide -ne change jamais
                    || (cache_group == "server" && this.isServerURLValid() )  //cas cache du server 
                    || (!group.endsWith("_nocache") && url.startsWith(this.devis_infos[form_name].url)) // cas cache ancien devis
                )
                //if (cache_group=="server" || group=="global" || (cache_group==group && cache_form==form_name) )
                {//url.startsWith(this.devis_infos[form_name].url)){
                    
                    
                    //meme url et parametres, accepte le cache
                    let cache = this.devis_infos[form_name].fields;
                    //(cache);
                     if(cache){

                         //prendre en compte les noms des vars 
                         let total = fi.fields.length; 
                        for (let i=0;i<total;i++){
                            // //(fi.fields[i]);
                            let key = fi.fields[i].id;
                            //recuper la valeur dans le cache 
                            let cached_field = this.getCachedValue(key, cache);
                            //("Valeur a remettre: "+cached_field.value)
                            if(cached_field){
                                fi.fields[i]['value'] = cached_field.value || '';//enregistre le cache
                                // //("verifie cache dedie au GPS");
                                if(cached_field.position){ 
                                    // //("une position:!:::");
                                    // //(cache[i].position)
                                    fi.fields[i]["position"] = cached_field.position;
                                }
                            }
                            
                            //let debug = fi.fields[i];
                            // //(debug.id+":"+debug.value);
                        }
                     }
                     //le cas GPS
                     
                    
                }
                
            }
            // //(form_name);
            this.devis_infos[form_name] = fi;//enregistre avec la clé/nom du formulaire 
            // //(fi);
            //NOTE: pas besoin de mettre les infos dans l'history ou le LS:
            //soit elles y sont deja (vient avec BACK/PREC ou chargement du LS)
            //soit la methode est appellée avant le changement d'URL (dyn.forms.component.next()) 
            //et les données seront enregistrées apres...
            console.log(fi);
            
            return fi;//retourne juste le formulaire

        })

    }
    private isServerURLValid(){
        //verifie si les valeurs actuelles (dans devis_infos) correspondent aux valeurs du cache server url (dans server_url)
        //si valide, permet le repopulate, sinon, repart sur du vide
        let mrch = this.get_raw_param("form_marchandise","marchandise");
        let from = this.get_raw_param("form_from","from");
        let to = this.get_raw_param("form_to","to");
       // let motif = this.get_raw_param("form_motif","motif");

        //("nouvelles valeurs:"+mrch+","+from+","+to);
        //(this._server_url_params);
        return (this._server_url_params.marchandise == mrch &&
                this._server_url_params.from == from &&
        this._server_url_params.to == to);// && this._server_url_params.motif == motif);
    }
    private getCachedValue(key, cache){
        for (let field of cache){
            if (field.id == key) return field;
        }
    }

    /**
     * Recupere les parametres d'url pour afficher le formulaire suivant
     * uniquement appellé par next()
     */
    load_next_page_url_async(group:string="",form:string="", endpoint?:string){
        return this.load_form_datas_async(group,form).then( (fi)=>{
            // //(fi);
            if(!fi) return {"error":true,"error_msg":"Pas de reponse serveur"};//pas de données
            if(fi['results'] || fi['message']) return fi;//fin de questionnaire

            //si locastorage, populate le formulaire 
            // //("Localstorage????");
            // if (this._cache){
            //     let form_name:string  = fi["key"].split("/")[1];//just ele nom
            //     let form = this._cache[form_name];
                
            //     // //(form);
            //     if (form){
            //         // //("formulaire deja rempli!!! repopulate");
            //         for (let field of fi.fields){
                        
            //             let v = form[field["id"]];
            //             if(v) field["value"] = v.value;//peut avoir d'autres données possiblement
            //         }
            //     }
            // }

            //sinon, renvoie les infos de navigation
            let k = this.current_key.split('/');

            //si tout bon, retourne les infos d'url 
            return {
                "group":k[0],
                "form":k[1]
            };


        });
    }


    /**
     * Avec le probleme du cache et les formulaires qui peuvent changer en cours de route,
     * demande avant affichage le nom des proprietes interressantes pour le calcul et 
     * affichage.
     * 
     * Voir comment se passer de ca....
    
    load_requested_workflow(){
        let url =  "/wp-admin/admin-ajax.php?action=get_workflow";
        
        return this._http.get(url)
        .toPromise().then( (rep)=>{
            return rep.json();//les données recuperer du serveur
        });
        
    } */
    /**
     * charge les informations du devis generes via l'application
     * compacte les données pour limiter l'utilisation du reseau
     * et simplifier le traitement derriere 
     * 
     * recupere le resultat AVEC LE WORKFLOW pour generer la page de resultats
     * END OF WORK 
     */
    load_devis_details_async(){//workflow){

        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        //recupere les données du formulaire pour envoie au webservice 
        let details = {};
        
        for (let key of Object.keys(this.devis_infos)){
            

            //normalement, key est le nom du formulaire
            let form = this.devis_infos[key];
            

            
            if(form.fields == null) continue;


            let form_fields = {};

            let field_count = 0;
            let field_id = "";


            for (let field of form.fields){
                
                form_fields[field.id] = field.value;
                field_count ++;
                field_id = field.id;

                //specials !!!! pour les champs GPS, enregistre aussi la position
                //meme si elle n'est pas utile...
                if(field["position"]){
                    let obj = {};
                    
                    let pos = field["position"];

                    obj['position'] = {
                        'city':pos.city,
                        'lat':pos.lat,
                        'lng':pos.lng,
                        'zipcode':pos.zipcode,
                        'country':pos.country
                    
                    };
                    form_fields['position'] = field.position;
                    field_count ++;
                    field_id = "position";

                
                }
                
            }

            

           

            if(field_count > 1){
                
                details[key] = form_fields;
            } else {
                //un seul field dans le formulaire, renvoie directement la valeur 
                
                details[key] = form_fields[field_id];
            }

        }


        let cred = "action=generate_quote&app_datas="+JSON.stringify(details)+"&origine="+this._origine;

        return this._http.post(TARGET+"/wp-admin/admin-ajax.php", cred,{
            headers:headers
        })
        .toPromise()
        .then( (res:Response)=>{
            let rep = res.json();
            if(rep["error"]) throw rep["error"];

            return rep;
        });
    }
    /**
     * recupere depuis le server un cache compacté a utiliser en cache
     * NOTE: version simplifiée du cache
     */
    private unpack_datas(datas){
        let cache = {};
        for (let key of Object.keys(datas)){
            //(key);//nom du formulaire
            cache[key]={
                "key":"server/"+key,//pe probleme...
                "fields":[]
            };
            let fields = cache[key]["fields"];
            let frm = datas[key];

            if(typeof frm == "string"){
                let prop = key.split('_')[1];
                //("nom de prop "+prop);
                fields.push({
                    "id":prop,
                    "value":frm
                });
            } else {

                //pe probleme position???
                let position = null;
                for (let prop of Object.keys(frm)){

                    if(prop == "position"){
                        //la, j'ai une couille.....
                        position = frm[prop];
                    } else {
                        //("nom de prop "+prop);
                        fields.push({
                            "id":prop,
                            "value":frm[prop]
                        });
                    }
                    
                }
                if(position){
                    //doit mettre dans le field 0
                    let f = fields[0];
                    if(f) f["position"] = position;//en dur, ca craint...
                }
            }


        }
        //("Unpacked datas:");
        //(cache)
        return cache;
    }

    //GPS: charge les prix pour le domicile 
    //@param zipcode: l'objet position a utiliser (ie: coords gps, zipcode, nom de ville) pour les calculs
    load_domicile_prices (zipcode:string){
        return this._http.get(this.create_geolocation_url(zipcode))
        .toPromise().then( (dt:any)=>{
            // //(dt);
            let options = JSON.parse(dt._body);
            if(options  && Array.isArray(options)){
                let sorted = options.sort( (elem1:any, elem2:any)=>{
                    // let v1 = +elem1.value.split('|')[1];
                    // let v2 = +elem2.value.split('|')[1];
                     let v1 = +elem1.total_price;
                     let v2 = +elem2.total_price;
                    return v1 - v2;
                });

                options = sorted;
            }
            

            return options;
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
        if (form === "") return "&origine="+this._origine;//demande a charger le premier formulaire

        let request = "&current="+group+"/"+form+"&origine="+this._origine;
        //si a le type de marchandise 
        //recup les 4 premiers fields comme parametres d'application
        //note si proviennent du cache, pas le meme chemin....
        // request += this.devis_infos["form_marchandise"] ? "&marchandise="+this.devis_infos["form_marchandise"].fields[0].value : "";
        // request += this.devis_infos["form_from"] ? "&from="+this.devis_infos["form_from"].fields[0].value : "";
        // request += this.devis_infos["form_to"] ? "&to="+this.devis_infos["form_to"].fields[0].value : "";
        // request += this.devis_infos["form_motif"] ? "&motif="+this.devis_infos["form_motif"].fields[0].value : "";
        request += this.get_param("form_marchandise","marchandise");
        request += this.get_param("form_from","from");
        request += this.get_param("form_to",'to');
        request += this.get_param("form_motif","motif");

         //la hauteur et largeur si existe 
        request += this.get_field_by_id("form_precisions","longueur");// this.devis_infos["form_precisions"] && this.devis_infos["form_precisions"]["longueur"] ? "&longueur="+this.devis_infos["form_precisions"]["longueur"].value : "";
        request += this.get_field_by_id("form_precisions","hauteur");//this.devis_infos["form_precisions"] && this.devis_infos["form_precisions"]["hauteur"] ? "&hauteur="+this.devis_infos["form_precisions"]["hauteur"].value : "";
        request += this.get_field_by_id("form_precisions","volume");
        request += this.get_field_by_id("form_precisions","conteneur_size");
        // //(request);
        //construit l'url 
        return request;

    }
    /**
     * helper: recupere la valeur d'un field d'un formulaire 
     * si inconnu, renvoie une chaine vide
     */
    private get_param(form, name){

        if(this.devis_infos[form] ){
            let frm = this.devis_infos[form];
            if(frm['fields'] && frm['fields'].length>0){
                if(frm['fields'][0].value) return "&"+name+"="+frm['fields'][0].value;
            }
        }
        return '';
    }
    get_raw_param(form, id){
        //("get_raw_param from:"+form+" name:"+id);
        if(this.devis_infos[form] && this.devis_infos[form]["fields"] ){
            for (let field of this.devis_infos[form]["fields"]){
                if(field["id"] == id) return field["value"];
            }
            
        }
        return '';
    }
    
    //genere l'URL pour la geolocation: recupere les valeurs pour les prises en charge a domicile
    create_geolocation_url(position:any){
        let zipcode = position.zipcode? position.zipcode.slice(0,2) : "";//juste le dep si dispo 
        // //("create geo url");
        // //(zipcode);
        //endpoint vers le webservice avec les infos de positions
        let request = TARGET+"/wp-admin/admin-ajax.php?action=webservice_geolocation_request&origine="+this._origine+"&form_name="+this.current_key+"&departement_code="+zipcode
                +"&lat="+position.lat+"&lng="+position.lng+"&city="+position.city;
        //le reste de l'url 
        request += this.devis_infos["form_marchandise"] ? "&marchandise="+this.devis_infos["form_marchandise"].fields[0].value : "";
        request += this.devis_infos["form_from"] ? "&from="+this.devis_infos["form_from"].fields[0].value : "";
        request += this.devis_infos["form_to"] ? "&to="+this.devis_infos["form_to"].fields[0].value : "";
        request += this.devis_infos["form_motif"] ? "&motif="+this.devis_infos["form_motif"].fields[0].value : "";

        
        //la hauteur et largeur si existe 
        request += this.get_field_by_id("form_precisions","longueur");// this.devis_infos["form_precisions"] && this.devis_infos["form_precisions"]["longueur"] ? "&longueur="+this.devis_infos["form_precisions"]["longueur"].value : "";
        request += this.get_field_by_id("form_precisions","hauteur");//this.devis_infos["form_precisions"] && this.devis_infos["form_precisions"]["hauteur"] ? "&hauteur="+this.devis_infos["form_precisions"]["hauteur"].value : "";
        request += this.get_field_by_id("form_precisions","volume");
        request += this.get_field_by_id("form_precisions","conteneur_size");
        
        //lance le requete
        return request;

    }
    /**
     * Helper methode
     * permet de recupere la valeur d'un champs de formulaire via son id 
     */
    private get_field_by_id(form, id){
        if(this.devis_infos[form] && this.devis_infos[form]["fields"] ){
            for (let field of this.devis_infos[form]["fields"]){
                if(field["id"] == id) return "&"+id+"="+field["value"];
            }
            
        }
        return '';
    }





    /**
     * GESTION DU LOCALSTORAGE ET DONNEES DE CACHE    ----------------------------------------------------------------------------------------
     */

    /**
     * Charge les données depuis le localstorage si possible
     */
    load_from_LS(){
        //recupere les dernieres données via le localstorage 
        if(window.localStorage){
            this._form_historic = JSON.parse(window.localStorage.getItem("historic")) || [];
            //this.last_visited_url_LS = window.localStorage.getItem("last_url");
            let form_datas = null;
            if(this._form_historic.length > 0) {
                //supprime le dernier element 
                //("un historique");

                let hist = this._form_historic.pop();//[this._form_historic.length -1];//.pop();
                this.last_visited_url_LS = hist.url;
                form_datas ={ 
                    "group": hist.group,
                    "form":hist.form,
                    "datas":hist.datas
                };
                this._form_current_historic = hist;//garde en memoire en cas de repop
            
            }
            let devis = JSON.parse(window.localStorage.getItem("app_datas"));
            if(devis){
                //donne au provider 
                this.set_devis_from_localstorage(devis, form_datas);
               
            }
        }
    }

    /**
     * Sauvegarde les données vers le localstorage si possible 
     * Convertie les données 'brutes' du formulaire en données 'light' pour gagner de la place en memoire
     */
    save_to_LS(){
        //sauvegarde l'etat de l'application dans le LS
         if(window.localStorage){
            let devis = this.get_devis();//recup le devis courant 
            
            
            //tranforme les données du formulaire en quelquechose de plus digeste pour sauvegarde locale 

            //si current_key!=null, alors enregistre l'historique de navigation dans les formulaires
            //force le formulaire courant comme dernier element de l'historique...
            if (this.current_key){
                let key = this.current_key.split('/');
                let form = key[1];
                let group = key[0];


                //dans un formulaire, indique le dans l'historique 
                let last_frm = this.devis_infos[key[1]];
                let dt = null;
                //if(group == "global")dt = this.compact_datas(last_frm);//global, garde les données
                //else  dt = this.compact_form_datas(last_frm);//les informations entrées dans le formulaire MAIS PAS ENCORE VALIDEES

                //recupere les données actuelles du formulaire (en cas de modif de la saisie)
                dt = this.compact_form_datas(last_frm);
                this.addToHistoric(key[0],key[1],last_frm["url"],last_frm["title"], dt);

                window.localStorage.setItem('historic',JSON.stringify(this._form_historic));//l'historique de la navigation dans les formulaires 
            }
           else {
            //    //("pas de current_key, ne sauvegarde pas les données");
               window.localStorage.setItem('historic',JSON.stringify([]));//efface au cas ou
           }

        //   //ne sauvegarde les formulaires decisifs
        //   delete(this.devis_infos["form_marchandise"]);
        //   delete(this.devis_infos["form_from"]);
        //   delete(this.devis_infos["form_to"]);
        //   delete(this.devis_infos["form_motif"]);
        //window.localStorage.setItem("last_url",this.last_visited_url_LS);
           window.localStorage.setItem("app_datas",JSON.stringify(this.compact_datas(this.devis_infos)) );//pour l'instant, sauvegarde tout comme un porc...
        }
    }

    /**
     * Afin de sauvegarder le maximum de place sur l'appareil de l'utilisateur,
     * on compacte les données pour ne sauvegarder que l'essentiel
     * 
     * formulaire: title: le titre qui s'affichera dans le devis final
     *             url: url de chargement du formulaire 
     *             fields: les champs du formulaire:
     *                  id: identifiant du field (pour repopulation)
     *                  value: la valeur actuelle du field
     *                  value_label: la version userfriendly de la value de la reponse (pour le devis final)
     *                  title: le label/titre du field
     *                  position: si gps actif 
     *                      city, lat, lng, zipcode, coutry
     */
    compact_datas(devis){
        let dt = {};
            for (let frm of Object.keys(devis)){

                if(devis[frm] == null) continue;

                let form = devis[frm];
                dt[frm] = this.compact_devis_form_datas(form);

                

            }
        return dt;
    }

    /**
     * compacte les données d'un formulaire en gardant les informations necessaires pour assurer les affichages
     */
    compact_devis_form_datas(form){
                

                let fds = [];//les fields
                let fields = form.fields;
                if(fields == null ) return;


                //("compacte form datas");
               
                let url = form.url;//url pour recup les données




                for (let field of fields){
                    let obj =
                    {
                        "value":field["value"] || null,
                        "value_label":field["value_label"] || field["value"],
                        "id": field["id"],
                        'title': field.title,//pour affichage dans le devis final 
                        //voir si autre chose?????
                        "data-type":field["data-type"],
                        "hide":field.hide
                    };
                    
                    //probleme value_label: si options, doit recuperer le label de l'option 
                    if(field.options && field["value"]!=null){
                        
                        let v  = this.get_label_for_value(field["value"], field.options);
                        
                        if(v) obj["value_label"] = v;

                    }
                    //certains fields utilise la geolocalisation et ont un field position a sauvegarder
                    
                    if(field["position"] || field["type"]=="gps") {
                        //(field)
                        
                        let pos = field["position"];
                        if (field["value"] && field["value"].startsWith("domicile")){
                            //recherche dans les options de domicile  
                            let infos =   pos['zipcode'];
                            if(!infos) infos = pos['city'];
                            else infos = infos.substr(0,2);                        
                            obj["value_label"] = "à domicile ("+infos+")";
                            if(field["position"]){
                                obj['position'] = {
                                'city':pos.city,
                                'lat':pos.lat,
                                'lng':pos.lng,
                                'zipcode':pos.zipcode,
                                'country':pos.country
                            }
                        }

                        } else if(field["value"] && field["value"].startsWith("depot") && field.options){
                            //doit en plus recuperer le nom du depot...
                            
                            obj["value_label"] = this.get_label_and_depot(field["value"],field.options[1]);
                        } else if(field["value"] && field["value"].startsWith("port") && field.options) {
                            //("Un port!!!");
                            //(field["value"]);
                            obj["value_label"] = "Dépot EXPEDOM "+obj["value_label"];
                        }
                        //un GPS!
                        
                        
                        
                    }
                    fds.push(obj);
                }
                //(form);
                return  {
                    "fields":fds,//pour les differents champs du formulaire 
                    "url":url, //pour le rechargement 
                    "title": form.title,//pour le devis final: voir a mettre un champs devis_title????
                    "form_id":form.key || form.form_id//clé du formulaire: group/nom
                    //je dois passer par une prop du nom form_id et pas key car la presence de key m'indique si 
                    //les données en memoires sont ou pas un descripteur de formulaire
                    //uniqumenet utilisé pour les resultats???
                    //,"key":form.key || form.form_id
                };
    }
    /**
     * recherche dans les options le label possible 
     */
    private get_label_for_value(value, options){
        for (let opt of options){
            
            
            if (opt["options"] || opt["locations"]){
                let lbl = this.get_label_for_value(value, opt["options"] || opt["locations"] );
                if(lbl) return lbl;
                //sinon, continue
            }
            else if (opt["value"] && opt["value"] == value) return opt["label"] || opt['title'];
        }
        return false;//on a pas trouvé
    }
    private get_label_and_depot(value, depots){
        for(let loc of depots.locations){
            for (let opt of loc.options){
                if(opt['value'] == value) return loc.label+" "+opt["title"];
            }
        }
    }
    //le formulaire en cours
    private compact_form_datas(form){
        let dt = { };
        let f = [];
        for (let field of form.fields){
            let dt = {
                "value":field.__value || null,
                "id":field.id
            };


            if(field.type=="tabs"){
              console.log("Tabs!!!!", field.__value)
            }
            
            //si une position, enregistre 
            if (field.position) dt["position"] = field.position;
            f.push(dt);
        }
        dt["fields"] = f;
        dt["url"] = form["url"];

        return dt;
    }
    




    /**
     * Sauvegarde des informations de devis dans IndexedDB      --------------------------------------------------------------------------------
     */
     /**
     * Recupere les devis precedements sauvegardés
     * NOTE: ne recupere QUE Id et sgbd_title pour affichage dans l'UI
     */
    get_all_saved_devis(){
        return this.open_DB().then( (db)=>{
            return this.read_all(db);
        });
            
    }
    //sauvegarde le devis en local (DB), uniquement les données du devis...
    save_current_devis(){
        return this.open_DB().then ( (db)=>{
            return this.save_to_sgbd(db, this.devis_infos);
        });
    }
    /**
     * Recupere les informaions d'un devis dans le sgbd 
     * @param id: l'identifiant du devis a recharger 
     */
    load_saved_devis(id:string){
        return this.open_DB().then( (db)=>{
            return this.load_from_sgbd( db, id);
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
                    //dt["sgbd_title"]="voir a gnerer un titre explicite....";
                    let save_data = {
                        "id" : dt["date"],
                        "v":dt
                    }
                   
                    
                    let request = db.transaction(["devis"], "readwrite")
                    .objectStore("devis")
                    .add(save_data);
                    
                    request.onsuccess = function(event) {
                        // //("success de l'enregistrement");
                        resolve(true);
                    };
                    
                    request.onerror = function(event) {
                        // //("une couille");
                        reject("Erreur enregistrement");
                    }
            } else {
                //pas de sauvegarde possible...
                reject("Impossible de creer une DB sur cette machine...");
            }
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
                //    //(cursor);
                   let v = cursor.value.v;

                   //cree un titre pour l'entrée 
                   results.push(v);
                   cursor.continue();
               }
               
               else {
                  resolve(results);
               }
            };
        
        });
    }

    private load_from_sgbd(db, id){
        
        return new Promise( (resolve, reject)=>{
            let objectStore = db.transaction("devis").objectStore("devis");
            let results = null;

            
            let cursor = objectStore.openCursor();
            cursor.onerror = function (event){ reject(event); }
            cursor.onsuccess = function(event) {
               var cursor = event.target.result;
               

               
               if (cursor) {
                   if(cursor.value.id == id) resolve(cursor.value.v);
                   return;
                //    let v = cursor.value.v.sgbd_title;//juste la description du formulaire
                //    let id = cursor.id;//la date d'enregistrement

                //    results.push({"id":id,"title":v});
                //    cursor.continue();
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

        //(datas);
        this.HACK_PREC(key,datas);


        let form_infos = new DynaForm();
        let inner = datas.acf;//recupere les formulaires 


        


        if (inner[key] === undefined){
            //Peut etre directement l'objet recherché
            //OU se trouver dans un suboptions!!!
            //(inner);
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
                //("recherche category:"+value);
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

            //("working on...");
            //(dirty);


            form_infos.title = dirty.title;
            form_infos.description = dirty.description;
            


            if (dirty.isSingular == 1){
                //("Singular field");
                //ce formulaire ne dispose que d'une seule question, generalement a choix multiple
                let field  = new MultigroupRadioField();//voir si besoin de faire plus general que ca...
                field.key = key;

                let parent = dirty.parent_group;//si doit se referer a quelquechose
                        
                //les groupes de datas, mais peut aussi avoir des precisions, fields, etc....
                if(dirty.group){
                    //represente un ensemble de possibilité reunie en une seule 
                    for (let gr of dirty.group){


                        if(parent){

                            //("Workaround transport");

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
                //("plusieurs champs");

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
                                    //(gr);
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
    //    //("looking for suboptions....");
    //    if(subOptions === undefined || subOptions.length == 0) return;
    //    //("on a des suboptions!!!");

    //    for (let so of subOptions){
    //        if(so.parent_group.toUpperCase() == field.key.toUpperCase()){
    //            //("Un suboption pour ce field!!!");
    //            for(let group of so.group){
    //                let symbol = group.itemId; //la valeur qui declenche l'apparation des sub-options
    //                //("recherche valeur: "+symbol);
                   
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
            //("HACK!!!!");
            
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