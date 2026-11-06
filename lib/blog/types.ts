export type Category='ogloszenia'|'slowo';
export const categories:Record<Category,string>={ogloszenia:'Ogłoszenia parafialne',slowo:'Słowo na dziś'};
export type Post={id:string;slug:string;title:string;excerpt:string;content:string;category:Category;author:string;image:string;status:'draft'|'published';published_at:number;created_at:number;updated_at:number;version:number;deleted_at:number|null};
export type Env={DB:import('../server/runtime').Database;BUCKET:import('../server/runtime').MediaStore;databaseConfigured:boolean;ADMIN_USERNAME:string;ADMIN_PASSWORD_HASH:string;ADMIN_SECRET_KEY:string;SITE_ORIGIN:string};
export type Session={id:string;role:string;csrf:string;created_at:number;last_seen:number;expires_at:number;credential_version:string;pending_secret:string|null};
