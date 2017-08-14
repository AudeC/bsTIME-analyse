angular.module('services', [])

.factory("UserManager", function($http){     
    
    function User(){
        this.id = 0;
        this.key = 0;
        this.pseudo = "";
        this.nom = "";
        this.email = "";
        this.stats = {};
        //this.u = {};
        
        this.init = function(u){
            this.id = u.cf_id; 
            this.key = u.cf_key;
            this.pseudo = u.cf_pseudo; 
            this.nom = u.cf_name; 
            this.email = u["cf_e-mail"];
            this.nom_entr = u["cf_nom-entreprise"];
            this.tel = u.cf_tel; 
            this.u = u;
            console.log(this);
        }
        
        this.setStats = function(u){
            this.stats = u; 
            console.log(this.stats);
        }
        
    
    }
    
    var usr = new User();
    this.api_url = "http://analyse.bstime.fr/appli/api.php";
    
    /*
        Fonction de connexion à la BDD
    */
    
    if(localStorage.getItem("sid")){
        this.SID = localStorage.getItem("sid");   
    } else {
       this.SID = "";
    }
    
    
    this.getSID = function(){
        return $http({
          method: 'GET',
          url: this.api_url+'?get_sid=1'
        })
    }
    
    this.getSession = function(){
        var th = this, sid = this.SID;
        return $http({
          method: 'GET',
          url: this.api_url+'?session_info=1&sid='+sid
        });
       
    }
    
    this.login = function(login, mdp){
        var sid = this.SID;
        return $http.post(this.api_url, {
            "login": login,
            "pw": mdp, 
            "sid": sid
        });
    }
    
    this.logout = function(){
         var sid = this.SID;
        this.SID = ""; 
         localStorage.removeItem("sid");
        return $http({
          method: 'GET',
          url: this.api_url+'?logout=1&sid='+sid
        });
    }
    
    this.getStats = function(){
         var sid = this.SID;
        return $http({
          method: 'GET',
          url: this.api_url+'?info=stats&sid='+sid
        });
        
    }
    
    this.updateUser = function(crit, val){
        if(!this.SID) return false; 
         
          var sid = this.SID;
         return $http.post(this.api_url, {
            update_user: "1",
            crit: crit,
            val : val,
            sid: sid
             
        });
    }
    
    
    this.usr = usr; 
   
    /*
        Fonctions de modifs dans la BDD. 
    */
    
    this.getAllDays = function(){
        var sid = this.SID;
        return $http({
          method: 'GET',
          url: this.api_url+'?info=jours&sid='+sid
        });
        
    }
     this.getDaysBy = function(crit, val){
         if( (crit != "etat") && (crit!="date") && crit!="id" ) return false; 
         
         var sid = this.SID;
        return $http({
          method: 'GET',
          url: this.api_url+'?info=jours&by='+crit+'&val='+val+'&sid='+sid
        });
         
     }
     
     this.getAllTasks = function(j_id){
         var sid = this.SID;
         return $http({
          method: 'GET',
          url: this.api_url+'?info=taches&id='+j_id+'&sid='+sid
        });
         
     }
     
     this.createTask = function(t){
          if(!t.tachescf_id) return false; 
         
          var sid = this.SID;
         return $http.post(this.api_url, {
             "create": 1,
            "tache": {
                id: t.tachescf_id,
                activite: t.tachescf_name_tache,
                categorie: t.tachescf_categorie,
                nature: t.tachescf_label,
                tampon_debut: t.tachescf_debut,
                tampon_fin: t.tachescf_fin,
                nb_eclairs: t.tachescf_inter_eclair,
                note: t.tachescf_notes
            },
            "sid": sid
        });
         
     }
     
     this.updateTask = function(t){
         if(!t.tachescf_id) return false; 
         
          var sid = this.SID;
         return $http.post(this.api_url, {
            "tache": t,
            "sid": sid
        });
         
     }
     
     this.cancelDay = function(id){
         var sid = this.SID;
         return $http({
          method: 'GET',
          url: this.api_url+'?annuler=1&id='+j_id+'&sid='+sid
         });
         
     }
     
     this.confirmDay = function(jid){
         
          var sid = this.SID;
         return $http({
          method: 'GET',
          url: this.api_url+'?valid_j=1&id='+jid+'&sid='+sid
        });
     }
    
    return this;
    
});