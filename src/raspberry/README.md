 # Qualcosa...
 
 
```javascript

const BleScanner = require('./root/app');

bleScanner = new BleScanner();

bleScanner.startScanning();

foo = (someData) => {
    // do some operation
    bleScanner.newEvent('event/new', someData);
}
```
