var EC = require('elliptic').ec;
var BN = require('bn.js');
var ec = new EC('secp256k1');
const keccak256 = require('js-sha3').keccak256;
var Web3 = require('web3');
var fs = require('fs');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

var waitTime = 10000;
var times = 1;

function promiseTimeout(ms, promise){

    // Create a promise that rejects in <ms> milliseconds
    let timeout = new Promise((resolve, reject) => {
      let id = setTimeout(() => {
        clearTimeout(id);
        reject('Timed out in '+ ms + 'ms.')
      }, ms)
    })
  
    // Returns a race between our timeout and the passed in promise
    return Promise.race([
      promise,
      timeout
    ])
}

var balances = [];
var counter = 0;
function hvBalance(wallet, key, c){
    const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/cb0f53b9d51743caa459dca2b61736e0'));
    var balance = web3.eth.getBalance(wallet)
    return promiseTimeout(waitTime, balance).then((b) => {
        // check balance
        console.log(wallet +' : '+(b/1000000000000000000.0)+ ' eth')
    }).catch((e) => {
        console.log('wallet '+wallet+' --> '+e.name);
        //console.log(e)
        counter++;
    }); //Will give value in.
}

var privateKey=Buffer.alloc(32, 0);
for(i = 0; i < 32; i++){
    privateKey[i] = Math.floor(Math.random() * 255);
}
var pk = new BN(privateKey);

function start(){
    console.log('\nNext Batch')
    //let xhr = new XMLHttpRequest();
    for(a = 0; a < times; a++){
        // var privateKey=Buffer.alloc(32, 0);
        for(i = 0; i < 32; i++){
            privateKey[i] = Math.floor(Math.random() * 255);
        }

        console.log("PK::"+privateKey.toString('hex'))

        var G = ec.g; // Generator point
        var pk = new BN(privateKey); // private key as big number
        //pk.iadd(new BN('1'));

        var pubPoint=G.mul(pk); // EC multiplication to determine public point

        var x = pubPoint.getX().toBuffer(); //32 bit x co-ordinate of public point
        var y = pubPoint.getY().toBuffer(); //32 bit y co-ordinate of public point 

        var publicKey =Buffer.concat([x,y])

        console.log("public key::"+publicKey.toString('hex'))

        const address = keccak256(publicKey) // keccak256 hash of  publicKey

        const buf2 = Buffer.from(address, 'hex');
        console.log("Ethereum Adress:::"+"0x"+buf2.slice(-20).toString('hex')) // take lat 20 bytes as ethereum adress

        balances.push(hvBalance("0x"+buf2.slice(-20).toString('hex'), privateKey.toString('hex'), a));

        //console.log('');
    }
}

start();