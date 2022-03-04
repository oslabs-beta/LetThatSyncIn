//public/sw.js
//importScripts('https://cdn.jsdelivr.net/npm/dexie@3.2.1/dist/dexie.min.js');
//import { openDB } from './indexedDB';

const cacheName = 'my-site-cache-v3';
let DB = null;
const version = 1;
const databaseName = 'notesDB';
const storeName = 'notesStore';
const keyPath = '_id';

self.addEventListener('install', event => {
  console.log('Attempting to install service worker and cache static assets');
  self.skipWaiting();
});


self.addEventListener('activate', event => {
  console.log('Activating new service worker...');

  const cacheAllowlist = [cacheName];

  //Remove unwanted caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      )
      .then( (arr) => {
        //open DB when sw is activated
        openDB();
      })
    })
  );
});

self.addEventListener('fetch', event => {
  console.log('Fetch event for ', event.request);

  //intercept request to /user/load
  // if (event.request.method === 'GET' && event.request.url === "http://localhost:3000/user/load") {
  //   fetch(event.request)
  //   .then(response => response.json)
  //   .then(data => {
  //     //this should be the array
  //     console.log('data from the /user/load endpoint: ', data);
  //   })
  // }
  event.respondWith(
    // console.log('inside event.respondWith')
    fetch(event.request)
    .then( (response) => {
      
      // Make clone of response
      const resCloneCache = response.clone();
      const resCloneDB = response.clone()
      //Open cache
      caches
        .open(cacheName)
        .then(cache => {
          //Add response to cache
          cache.put(event.request, resCloneCache);
        })
        if (event.request.method === 'GET' && event.request.url === "http://localhost:3000/user/load") {
          resCloneDB.json().then(data => {
            console.log('this is the rescloneDB: ', data)
            //delete existing indexedDB data
            if (DB) {
              dbDeleteAll();
            } else {
              openDB( () => {
                dbDeleteAll();
              })
            }
            //populate indexedDB here
            data.data.forEach( note => {
              if (DB) {
                dbAdd(note);
              } else {
                openDB( () => {
                  dbAdd(note);
                })
              }
            })
          })
        }
        return response;
    })
    // if network is unavailable
    .catch((err) => {
      // intercept network request and store to indexedDB (background-sync?)
      // concurrently, start making local changes to indexedDB
      console.log('Network is unavailable, heading into catch block')
      console.log('method: ',event.request.method);
      console.log('url: ', event.request.url);
      if (event.request.method === 'GET' && event.request.url === "http://localhost:3000/user/load"){
         console.log('Intercepting server request to load user notes');

      }
      return caches.match(event.request)
      .then(response => response)
    }))
});

//open Database
function openDB (callback) {
  let req = indexedDB.open(databaseName, version);
  req.onerror = (err) => {
    //could not open db
    console.log('Error: ', err);
    DB = null;
  };
  req.onupgradeneeded = (event) => {
    let db = event.target.result;
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, {
        keyPath: keyPath,
      });
    }
  };
  req.onsuccess = (event) => {
    DB = event.target.result;
    //dbDeleteAll();
    console.log('db opened and upgraded', DB);
    if (callback) {
      callback();
    }
  };
};

function dbAdd(dataObject) {
  if (dataObject && DB) {
    let tx = DB.transaction(storeName, 'readwrite');
    tx.onerror = (err) => {
      console.log('failed transaction');
    };
    tx.oncomplete = (event) => {
      console.log('data saved successfully');
    };
    let store = tx.objectStore(storeName);
    let req = store.put(dataObject);

    req.onsuccess = (event) => {
      //will trigger tx.oncomplete next
    };
  } else {
    console.log('no data was provided');
  }
}

function dbDeleteAll() {
  if (DB) {
    let tx = DB.transaction(storeName, 'readwrite');
    tx.onerror = (err) => {
      console.log('failed transaction');
    };
    tx.oncomplete = (event) => {
      console.log('transaction success');
    };
    let store = tx.objectStore(storeName);
    req = store.clear();
    req.onsuccess = (event) => {
      //will trigger tx.oncomplete
    };
  } else {
    console.log('DB is closed');
  }
}

// async function dbQuery(username) {
//   const someFriends = await db.notes
//   .where('username').equals(username).toArray();
//   return console.log('here is the data: ', someFriends);
// }