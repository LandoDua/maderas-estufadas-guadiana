// import { app } from "./firebase.config";
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const { admin } = require('./firebase.config')


const auth = admin.auth()

class UserRepository {
  static create({ user, email, password }) {
    console.table({ user, email, password });

    
    auth.createUser({
        email: email,
        password: password,
        displayName: user
    })
    .then((userRecord)=>{
        return userRecord.uid
        
    }).catch((error)=>{
        if (error.code === 'auth/email-already-in-use') {
            return {
                err : 'Error. Usuario duplicado.'
              }
        } else {
            return {
                err : 'Error al agregar usuario.'
              }
        }
    })
  }

  static async login({ email, password }) {
    console.table({ email, password })
    try {
        await auth.signInWithEmailAndPassword(email, password);
        console.log('Usuario autenticado correctamente');
    } catch (error) {
        
    }
  }

  static async all(){
    const lista_usuarios = {}

    const listUsersResult = await auth.listUsers()
    console.log(listUsersResult);
    
    // auth.listUsers(1000)
    // .then((listUsersResult) => {
        
    //     // listUsersResult.users.forEach((userRecord) => {
    //     //     userRecord.toJSON()
    //     //     const userUID = userRecord.uid
            
    //     //     lista_usuarios[userUID] = {uid: userRecord.uid,
    //     //         email: userRecord.email,
    //     //         user : userRecord.displayName
    //     //      }
    //     //     }
    //     // );
        
        
    //     // if (listUsersResult.pageToken) {
    //     //     // Listar la siguiente página de usuarios
    //     //     // ...
    //     // }
    //     // console.log(typeof(lista_usuarios));
    //     return listUsersResult
        


//     })
//     .then(()=>{
        
//     })
//     .catch((error) => {
//         console.log('Error listing users:', error);
//     });
   
  }


}

module.exports = { UserRepository };
