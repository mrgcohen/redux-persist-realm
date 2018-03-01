import Realm from 'realm';

class RealmPersistInterface {
    constructor() {
        this.realm = new Realm({
            schema: [{
                name: 'Item',
                primaryKey: 'name',
                properties: {
                    name: 'string',
                    content: 'string',
                },
            }],
        });

        this.items = this.realm.objects('Item');
    }

    getItem = (key, callback) => {
        const promise = new Promise((resolve, reject) => {
            try {
                const matches = this.items.filtered(`name = "${key}"`);

                if (matches.length > 0 && matches[0]) {
                    resolve(matches[0].content);
                } else {
                    reject(new Error(`Could not get item with key: '${key}'`));
                }
            } catch (error) {
                reject(error);
            }
        });

        if (callback && typeof callback === 'function') {
            promise
                .then((content) => callback(null, content))
                .catch((e) => callback(e));
        }
   
        return promise;
    };

    setItem = (key, value, callback) => {
        const promise = new Promise((resolve, reject) => {
            this.getItem(key).then(() => {
                try {
                    this.realm.write(() => {
                        this.realm.create(
                            'Item',
                            {
                                name: key,
                                content: value,
                            },
                            true
                        );
                    });
                } catch (error) {
                    reject(error);
                }
            }).catch((error) => {
                try { 
                    this.realm.create(
                        'Item',
                        {
                            name: key,
                            content: value,
                        }
                    );
                } catch (error) {
                    reject(error);
                }
            }).finally(() => {
                resolve();
                if (callback && typeof callback === 'function'){
                    callback();
                }
            });
        });
        if (callback && typeof callback === 'function'){
            promise.catch((error) => callback(error)};
        });  
        return promise;
    };

    removeItem = (key, callback) => {
        const promise = new Promise((reject, resolve) => {
            try {
                this.realm.write(() => {
                    const item = this.items.filtered(`name = "${key}"`);
                    this.realm.delete(item);
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
        
        if (callback && typeof callback === 'function') {
            promise
                .then((content) => callback(null, content))
                .catch((e) => callback(e));
        }
        
        return promise;
    };

    getAllKeys = (callback) => {
        const promise = new Promise((reject, resolve) => {
            try {
                const keys = this.items.map(
                    (item) => item.name
                );

                resolve(keys);
            } catch (error) {
                reject(error);
            }
        });
        
        if (callback && typeof callback === 'function') {
            promise
                .then((content) => callback(null, content))
                .catch((e) => callback(e));
        }
        
        return promise;
    };
}

const singleton = new RealmPersistInterface();

export default singleton;
