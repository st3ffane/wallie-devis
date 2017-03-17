import{Pipe} from "@angular/core";


@Pipe({name: 'fnaa_group'})
export class FNAAGroupPipe {
  constructor(){}

  transform(datas) {
      //2 cas, string: immat, obj: infos fnaa
      if(!datas) return "Non";

      let ret = [];
      for (let dt of datas){
          if(typeof dt == "string") ret.push(dt);
          else{
              if(dt.error){
                  //unqiement le numero de la plaque 
                  ret.push(dt.immatriculation);
              } else {
                  //nom et version du vehicule
                  ret.push( dt.marque +" "+dt.modele);
              }
              
          }
         
      }
    return ret.join("<br/>");
  }
}