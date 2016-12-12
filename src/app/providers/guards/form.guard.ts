import { Injectable }             from '@angular/core';
import { Router, Resolve,
         ActivatedRouteSnapshot } from '@angular/router';

import { DevisProvider } from '../devis.provider';

//verifie que les données pour affichage du formulaire sont chargées
//sinon, charge les données a partir des parametres dùrl sauvegardés dans le LS

// @Injectable()
// export class FormDetailResolve implements Resolve<any> {

//   constructor(private cs: DevisProvider, private router: Router) {}


//   resolve(route: ActivatedRouteSnapshot): Promise<any>|boolean {
//     console.log("Guard activate....");
//     //recupere les infos de l'URL
//     let group = route.params['group'];
//     let form = route.params["form"];

//     let key = group+"/"+form;

//     if(this.cs.get_devis()[key]) {
//       console.log("Datas are here, everything is OK!");
//       return Promise.resolve(this.cs.get_devis()[key]);//renvoie les données du formulaire courant
//     }

//     console.log("No form datas, must load ");
//     //sinon, recupere l'URL et recharge 
//     let url = this.cs.last_visited_url;
//     console.log(url);
//     return this.cs.next(url.group || "",url.form || "") .then(crisis => {
//       if (crisis) {
//         return crisis;
//       } else {
//          // le formulaire est inconnu, renvoie vers une page d'erreur?
//         this.router.navigate(['/hello']);
//         return false;
//       }
//     });
//   }
// }
