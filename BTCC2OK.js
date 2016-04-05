var TotCNY = 319227.69;
var TotBTC = 159+143;
var diffLimit = 0.0060;
var inverseLimit = -0.003; 
var DWLimit = 45000;
//var inverseLimit = -0.002; 
/*
 * wait to add:
 * https://data.btcchina.com/data/orderbook?market=btccny&limit=5
*/
var rateBuy = 18.6;
var rate = 20.0;
var rateSell = rate;
var JPYAmount = 0;
var BTCChina = require('btccAPI');
var publicBtcchina = new BTCChina();
//BTCC API access !!
var key = "";
var secret = "";

var privateBtcchina = new BTCChina(key, secret);

var BTCCBuyPrice = 0;
var BTCCSellPrice = 0;
var OKcoinBuyPrice = 0;
var OKcoinSellPrice = 0;
var BTCClast = 0;
var OKLast = 0.1;
// DO NOT change TotCNY less than 50,000 CNY !!!!! 
var tradeBTC = 4;
var properGap = 1;
var step = 8;
var lowLomit = step ;
var initializeGap = step * 2 ;
var highLimit = step * 3 ;

var WebSocket = require('ws');
var events = require("events");
var emitter = new events.EventEmitter();
var OK = new WebSocket('wss://real.okcoin.cn:10440/websocket/okcoinapi');
//OKcoin API access
var api_key = "";
var secret_key = "";

//var Ripple = new WebSocket('wss://s1.ripple.com:443');
var MY_ADDRESS = "";
var gatewaySnapswap = "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q";
var gatewayRipplechina = "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA";
var gatewayRipplecn = "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK";
var gatewayRipplefox = "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y";
var gatewayTokyo = "r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN";


var LimitAmount = 0.01; //Do not be smaller than ~0.01 BTC

var priceBID = 10000;
var priceASK = 10;
var myASKprice = 0;
var myBIDprice = 0;
var FlagBalanceOK = 0;
var OffersASK = [];
var OffersBID = [];
var TradeCNY = 0;
var OKcoinBTC = 0;
var OKcoinBTCfree = 0;
var OKcoinBTCfreezed = 0;
var OKcoinCNY = 0;
var OKcoinCNYfree = 0;
var OKcoinCNYfreezed = 0;
var BTCCCNYfree = 0;
var BTCCCNYfreezed = 0;
var BTCCBTCfree = 0;
var BTCCBTCfreezed = 0;
var preOKcoinCNY = -1;
var preRippleCNY = 0;
var flagOKCNY = 0;
var flagOKBTC = 0;
var flagdo = 0;

var flagOK = 0;
var flagBTCC = 0;
var flagRipple = 1;
var FLAGokbuy = 0;
var FLAGoksell = 0;

var RippleCNY = 0;
var RippleBTC = 0;
var RippleJPY = 0;
/*
Ripple.on('open', function(){
	console.log('connected Ripple');
	account_lines();
	setInterval(account_lines,3000);
});
*/
OK.on('open', function(){
	OKticker();
	setTimeout(function(){
		emitter.emit('start');
	},7000);
});
emitter.on('start',function(){
	if (flagRipple === 0) throw Error('Ripple is not on connection!');
	console.log('TotCNY: ',TotCNY);
	console.log('TotBTC: ',TotBTC);
	//console.log('start !');
	getAccountInfo();
	setTimeout(function(){
		console.log('your CNY:');
		console.log('    BTCC:',Math.floor(BTCCCNYfree+BTCCCNYfreezed));
		console.log('  OKcoin:',Math.floor(OKcoinCNY));
		//console.log('  Ripple:',Math.floor(RippleCNY));
		console.log('   total:',Math.floor(BTCCCNYfree+BTCCCNYfreezed+OKcoinCNY+RippleCNY));
		console.log('your BTC:');
		console.log('    BTCC:',BTCCBTCfree+BTCCBTCfreezed);
		console.log('  OKcoin:',OKcoinBTC);
		//console.log('  Ripple:',RippleBTC);
		console.log('   total:',BTCCBTCfree+BTCCBTCfreezed+OKcoinBTC+RippleBTC);
	},10000);
	setInterval(function(){
		getAccountInfo();
		flagdo = 1;
	},3000);
});
setInterval(function(){
	if (flagOK === 0) throw Error('lost OK connection');
	if (flagBTCC === 0) throw Error('lost BTCC connection');
	flagBTCC = 0;
	flagOK = 0;
},50*1000);
setInterval(function(){
	//console.log(BTCCBTCfree,OKcoinBTCfree);
	if (BTCCBTCfree + OKcoinBTCfree + RippleBTC < TotBTC) return 0;
	if(BTCCBTCfree > 150 && OKcoinBTCfree < 40){
		getWithdrawal(30);
		console.log('BTCC ---> OKcoin @ 20 BTC');
	}else if(BTCCBTCfree < 50 && OKcoinBTCfree > 150){
		//if (BTCCBTCfree + OKcoinBTCfree + RippleBTC < TotBTC) return 0;
		OKcoinWithdraw('BTCC 30');
		console.log('OKcoin ---> BTCC @ 20 BTC');
	}else if(OKcoinBTCfree > 90 && RippleBTC < 25){
		//if (BTCCBTCfree + OKcoinBTCfree + RippleBTC < TotBTC) return 0;
		//OKcoinWithdraw('Ripple 25');
		//console.log('OKcoin ---> Ripple @ 25 BTC');
	}
},2*60*1000);

//////////////////////////////////////////////////////////////////////////////////
//BTCC API
/////////////////////////////////////////////////////////////////////////////////////
function OKbuyBTCCsell(Amount){
	var amount = Amount;
	if (amount > OKcoinCNYfree/OKLast * 1.05) {
		//console.log('amount:',amount);
		//console.log('amount from okcoin CNY:',OKcoinCNYfree/OKLast * 0.95);
		amount = OKcoinCNYfree/OKLast*0.95;
	}
	if (amount > BTCCBTCfree * 1.05) amount = BTCCBTCfree*0.95;
	amount = Math.floor(amount * 1e3)/1e3;
	if (amount < LimitAmount * 2) return 0;	
	FLAGokbuy = 1;
	BTCCsell(null,amount);
}
function BTCCbuyOKsell(Amount){
	var amount = Amount;
	if (amount > BTCCCNYfree/BTCCSellPrice * 1.05) amount = BTCCCNYfree/BTCCSellPrice*0.95; 
	if (amount > OKcoinBTCfree * 1.05) amount = OKcoinBTCfree*0.95;
	amount = Math.floor(amount * 1e3)/1e3;
	if (amount < LimitAmount * 2) return 0;	
	FLAGoksell = 1;
	BTCCbuy(null,amount);
}
/*
function BTCCticker() {
	publicBtcchina.ticker(function(err,data){
		if (err) {
			return 0;
		}else{
			var temp =  data.ticker;
			BTCCBuyPrice = temp.buy/1.0;
			BTCCSellPrice = temp.sell/1.0;
			BTCClast = temp.last/1.0;
			//console.log(BTCClast);
		}
		if (BTCCBuyPrice >= BTCCSellPrice) {
			//console.log('BTCC gives wrong message!');
			//console.log(data);
			return 0;
		}
		if (flagdo === 0) return 0;
		flagdo = 0;
		flagBTCC = 1;
		//console.log(OKLast,BTCClast);
		if (OKLast - BTCClast > 500 || BTCClast - OKLast > 500) {
			console.log(OKLast,BTCClast);
			throw Error('impossible price diff !!!');
		}
		if (OKLast > 10000 || OKLast < 100) throw Error('~');
		if (BTCClast > 10000 || BTCClast < 100) throw Error('~');
		if (BTCCBuyPrice > 10000 || BTCCBuyPrice < 100) throw Error('~');
		if (BTCCSellPrice > 10000 || BTCCSellPrice < 100) throw Error('~');
		if (OKcoinBuyPrice > 10000 || OKcoinBuyPrice < 100) throw Error('~');
		if (OKcoinSellPrice > 10000 || OKcoinSellPrice < 100) throw Error('~');
		var Diff = OKcoinBuyPrice - BTCCSellPrice;
		var Inverse = OKcoinSellPrice - BTCCBuyPrice;
		if (Diff > OKLast * diffLimit){
			if (Diff > 500) throw Error('impossible price high !!!');
			if (Diff > OKLast * 0.02){
				BTCCbuyOKsell(2);
			}else if (Diff > OKLast * (diffLimit + 0.006)){
				BTCCbuyOKsell(1);
			}else if (Diff > OKLast * (diffLimit + 0.003)){
				if (Math.random() < 0.99) BTCCbuyOKsell(0.8);
			}else if (Diff > OKLast * (diffLimit + 0.002)){
				if (Math.random() < 0.99) BTCCbuyOKsell(0.6);
			}else if (Diff > OKLast * (diffLimit + 0.001)){
				if (Math.random() < 0.99) BTCCbuyOKsell(0.4);
			}else if (Diff > OKLast * diffLimit){
				if (Math.random() < 0.99) BTCCbuyOKsell(0.2);
			}
			setOKorder();
		}else if (Inverse < OKLast * inverseLimit){ 
			if (Inverse < -500) throw Error('impossible price inverse !!!');
			if (Inverse < (inverseLimit - 0.008) * OKLast){
				OKbuyBTCCsell(3);
			}else if (Inverse < (inverseLimit - 0.004) * OKLast){
				OKbuyBTCCsell(3);
			}else if (Inverse < (inverseLimit - 0.003) * OKLast){
				OKbuyBTCCsell(2.5);
			}else if (Inverse < (inverseLimit - 0.002) * OKLast){
				if (Math.random() < 0.99) OKbuyBTCCsell(2.0);
			}else if (Inverse < (inverseLimit - 0.001) * OKLast){
				if (Math.random() < 0.99) OKbuyBTCCsell(1.5);
			}else if (Inverse < inverseLimit * OKLast){
				if (Math.random() < 0.99) OKbuyBTCCsell(1);
			}
			setOKorder();
		}else{
			setOKorder();
		}
	});
}
*/
function BTCCbuy(price, amount){
	if (amount < LimitAmount * 1.99) return 0;
	var buyA = Math.floor(amount * 1e4)/1e4;
	/*
	var diffCNY = BTCCCNYfree + BTCCCNYfreezed + OKcoinCNY - TotCNY;
	var amountD = 0;
	if (diffCNY > 0) {
		amountD = Math.floor(diffCNY/OKLast * 1e4)/1e4;
	}else {
		amountD = Math.ceil(diffCNY/OKLast * 1e4)/1e4;
	}
	if (amountD > 2 * LimitAmount) buyA = buyA + LimitAmount;
	if (amountD < -2 * LimitAmount) buyA = buyA - LimitAmount;

	if (buyA > BTCCCNYfree/BTCCSellPrice * 1.02) buyA = BTCCCNYfree/BTCCSellPrice; 
	if (buyA > OKcoinBTCfree * 1.02) amount = OKcoinBTCfree;
	
	buyA = Math.floor(buyA * 1e4)/1e4;
    */
	privateBtcchina.buyOrder2(price, buyA , function(err,data){
        if (err) {
            console.log('BTCCbuy err:',err);
			FLAGoksell = 0;
        }else{
			console.log('buy',buyA,'in BTCC');
            //console.log('BTCC buy order id:',data.result);
			if (FLAGoksell === 1){
				//console.log('huge price diff: ',OKcoinSellPrice-BTCCBuyPrice,'@',amount);
				//OKmarketsell(Math.floor(amount * 1e3)/1e3);
				sell(OKcoinBuyPrice-3,Math.floor((amount-0.002) * 1e3)/1e3);
				console.log('and sell',amount,'in OKcoin');
				FLAGoksell = 0;
			}
        }
    });
}
function BTCCsell(price, amount){
	if (amount < LimitAmount * 1.99) return 0;
	var sellA = Math.floor(amount*1e4)/1e4;
	/*
	var diffCNY = BTCCCNYfree + BTCCCNYfreezed + OKcoinCNY - TotCNY;
	var amountD = 0;
	if (diffCNY > 0) {
		amountD = Math.floor(diffCNY/OKLast * 1e4)/1e4;
	}else {
		amountD = Math.ceil(diffCNY/OKLast * 1e4)/1e4;
	}
	if (amountD > 2 * LimitAmount) sellA = sellA - LimitAmount;
	if (amountD < -2 * LimitAmount) sellA = sellA + LimitAmount;
	
	
	if (sellA > OKcoinCNYfree/OKLast * 1.02) sellA = OKcoinCNYfree/OKLast; 
	if (sellA > BTCCBTCfree * 1.02) sellA = BTCCBTCfree;

	sellA = Math.floor(sellA*1e4)/1e4;
	*/
    privateBtcchina.sellOrder2(price, sellA , function(err,data){
        if (err) {
            console.log('BTCCsell err:',err);
			FLAGokbuy = 0;
        }else{
			console.log('sell',sellA,'in BTCC');
            //console.log('BTCC sell order id:',data.result);
			if (FLAGokbuy === 1){
				//console.log('inverse price diff: ',OKcoinSellPrice-BTCCBuyPrice,'@',amount);
				//OKmarketbuy(Math.floor((OKcoinSellPrice+3)*amount*1e2)/1e2);
				buy(OKcoinSellPrice+3,Math.floor((amount+0.002) * 1e3)/1e3);
				console.log('and buy',amount,'in OKcoin');
				FLAGokbuy = 0;
			}
        }
    });
}
function BTCCmarketsell(amount){
	var sellA = Math.floor(amount * 1e4)/1e4;
	console.log('BTCC market sell',sellA);
    privateBtcchina.sellOrder2(null, sellA, function(err,data){
        if (err) {
            console.log('BTCCbuy err:',err);
        }else{
            console.log('BTCC market sell order id:',data.result);
        }
    });
}
function BTCCmarketbuy(amount){
	var buyA = Math.floor(amount * 1e4)/1e4;
	console.log('BTCC market buy',buyA);
    privateBtcchina.buyOrder2(null, buyA, function(err,data){
        if (err) {
            console.log('BTCCbuy err:',err);
        }else{
            console.log('BTCC buy order id:',data.result);
        }
    });
}
function getMarketDepth2(){
    privateBtcchina.getMarketDepth2(null, function(err,data){
        if (err) {
            //console.log('getMarketDepth2 err:',err);
			return 0;
        }else{
            var temp = data.result.market_depth;
			var tempask = 0;
			var tempbid = 0;
			var order;
			var totAmount = 0;
			for (var i=0; i<temp.ask.length; i++){
				order = temp.ask[i];
				//console.log(order);
				BTCCSellPrice = order.price;
				totAmount = totAmount + order.amount;
				if (totAmount > 2) break;
			}
			totAmount = 0;
			for (i=0; i<temp.bid.length; i++){
				order = temp.bid[i];
				BTCCBuyPrice = order.price;
				totAmount = totAmount + order.amount;
				if (totAmount > 2) break;
			}
            //console.log('market ask orders:', temp.ask);
            //console.log('market bid orders:', temp.bid);
			BTCClast = Math.floor((BTCCBuyPrice+BTCCSellPrice)/2.0*100)/100;
			//console.log(BTCCBuyPrice,BTCCSellPrice,BTCClast);
		}
		if (BTCCBuyPrice >= BTCCSellPrice) {
			//console.log('BTCC gives wrong message!');
			//console.log(data);
			return 0;
		}
		if (flagdo === 0) return 0;
		flagdo = 0;
		flagBTCC = 1;
		//console.log(OKLast,BTCClast);
		if (OKLast - BTCClast > 500 || BTCClast - OKLast > 500) {
			console.log('ok:',OKLast,'BTCC:',BTCClast);
			throw Error('impossible price diff !!!');
		}
		if (OKLast > 10000 || OKLast < 100) throw Error('~');
		if (BTCClast > 10000 || BTCClast < 100) throw Error('~');
		if (BTCCBuyPrice > 10000 || BTCCBuyPrice < 100) throw Error('~');
		if (BTCCSellPrice > 10000 || BTCCSellPrice < 100) throw Error('~');
		if (OKcoinBuyPrice > 10000 || OKcoinBuyPrice < 100) throw Error('~');
		if (OKcoinSellPrice > 10000 || OKcoinSellPrice < 100) throw Error('~');
		var Diff = OKcoinBuyPrice - BTCCSellPrice;
		var Inverse = OKcoinSellPrice - BTCCBuyPrice;
		if (Diff > OKLast * diffLimit){
			if (Diff > 500) throw Error('impossible price high !!!');
			if (Diff > OKLast * 0.025){
				BTCCbuyOKsell(10);
			}else if (Diff > OKLast * (diffLimit + 0.01)){
				BTCCbuyOKsell(3);
			}else if (Diff > OKLast * (diffLimit + 0.006)){
				BTCCbuyOKsell(1);
			}else if (Diff > OKLast * (diffLimit + 0.003)){
				if (Math.random() < 0.99) BTCCbuyOKsell(0.8);
			}else if (Diff > OKLast * (diffLimit + 0.002)){
				if (Math.random() < 0.99) BTCCbuyOKsell(0.6);
			}else if (Diff > OKLast * (diffLimit + 0.001)){
				if (Math.random() < 0.99) BTCCbuyOKsell(0.4);
			}else if (Diff > OKLast * diffLimit){
				if (Math.random() < 0.99) BTCCbuyOKsell(0.2);
			}
			//setOKorder();
		}else if (Inverse < OKLast * inverseLimit){ 
			if (Inverse < -500) throw Error('impossible price inverse !!!');
			if (Inverse < (inverseLimit - 0.015) * OKLast){
				OKbuyBTCCsell(10);
			}else if (Inverse < (inverseLimit - 0.008) * OKLast){
				OKbuyBTCCsell(8);
			}else if (Inverse < (inverseLimit - 0.005) * OKLast){
				OKbuyBTCCsell(5);
			}else if (Inverse < (inverseLimit - 0.003) * OKLast){
				OKbuyBTCCsell(4);
			}else if (Inverse < (inverseLimit - 0.002) * OKLast){
				if (Math.random() < 0.99) OKbuyBTCCsell(3.0);
			}else if (Inverse < (inverseLimit - 0.001) * OKLast){
				if (Math.random() < 0.99) OKbuyBTCCsell(2);
			}else if (Inverse < inverseLimit * OKLast){
				if (Math.random() < 0.99) OKbuyBTCCsell(1);
			}
			//setOKorder();
		}else{
			setOKorder();
		}
	});
}
function getAccountInfo(){
    //var param = "all";
    var param = "balance";
    privateBtcchina.getAccountInfo(param, function(err,data){
        if (err) {
            //console.log('BTCC getAccountInfo balance err:',err);
            //if (ERRflag1 === 1) throw Error('ERR: BTCC getAccountInfo balance');
        }else{
            var temp = data.result;
            if (temp.balance) {
                BTCCCNYfree = temp.balance.cny.amount/1.0;
                BTCCBTCfree = temp.balance.btc.amount/1.0;
                //console.log(temp.balance);
            }
			OKuserinfo();
        }
    });
    param = "frozen";
    privateBtcchina.getAccountInfo(param, function(err,data){
        if (err) {
            //console.log('BTCC getAccountInfo frozen err:',err);
            //if (ERRflag2 === 1) throw Error('ERR: BTCC getAccountInfo frozen');
        }else{
            var temp = data.result;
            //if (temp.balance) console.log(temp.balance);
            if (temp.frozen) {
                BTCCCNYfreezed = temp.frozen.cny.amount/1.0;
                BTCCBTCfreezed = temp.frozen.btc.amount/1.0;
            }
            //if (temp.profile) console.log(temp.profile);
        }
    });
}
function getOrders(){
    privateBtcchina.getOrders(true, function(err,data){
        if (err) {
            console.log('BTCC getOrders err:',err);
        }else{
            var temp = data.result;
            console.log(temp);
        }
    });
}
function getWithdrawal(amount){
	privateBtcchina.requestWithdrawal('BTC', Math.floor(amount), console.log);
}




/////////////////////////////////////////////////////////////////
//OKcoin API
/////////////////////////////////////////////////////////////////
function initializeParameter(){
	if (FlagOK === 1 && FlagRipple === 1) {
		emitter.emit('connected');
	}else {
		console.log("OK:",FlagOK);
		console.log("ripple:",FlagRipple);
		throw Error('connection time out !!!!!!');
	}
}
/*
Ripple.on('open', function(){
		//console.log('connected to ripple !');
		account_lines();
		bookOffers();
		FlagRipple = 1;
		});
		*/
function OKcoinWithdraw(str){
	var exec = require('child_process').exec;
	var command = 'python3.4 ./withdrew/OKwithdraw.py '+str;
	exec(command,function(error,stdout,stderr){
    if(stdout){
        console.log(stdout);
    } else if(stderr) {
        console.log(stderr);
    }
    if(error) {
        console.info('stderr : '+stderr);
    }
});
}


function ping(){
	var MES = { "event" : "ping" };
	OK.send(JSON.stringify(MES));
	FlagOK = 0;
}

function OKticker(){
	var MES = {
		"event": "addChannel",
		"channel": "ok_sub_spotcny_btc_ticker"
	};
	OK.send(JSON.stringify(MES));
}
function RESticker(data){
	OKcoinSellPrice = data.sell * 1;
	OKLast = data.last * 1;
	OKcoinBuyPrice = data.buy * 1;
	var timestamp = data.timestamp * 1;
	flagOK = 1;
	if (OKcoinSellPrice <= OKcoinBuyPrice) throw Error('OKcoin gives wrong message!');
	//console.log(data);
}

function OKdepth(){
	var MES = {
		"event": "addChannel",
		"channel": "ok_btccny_depth"
	};
	OK.send(JSON.stringify(MES));
}
function RESdepth(data){
	var bids = data.bids;
	var asks = data.asks;
	var timestamp = data.timestamp * 1;
	//console.log(asks);
	//console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~");
	//console.log(bids);
}

function OKtrades(){
	var	MES = {
		"event": "addChannel",
		"channel": "ok_btccny_trades_v1"
	};
	OK.send(JSON.stringify(MES));
}
function REStrades(data){
	var trades = data;
	//console.log(trades);
}

function OKrealtrades(){
	var sign = MD5("api_key="+api_key +
			"&secret_key="+secret_key);
	var MES = {
		"event": "addChannel",
		"channel": "ok_cny_realtrades",
		"parameters" : {
			"api_key" : api_key,
			"sign" : sign
		}
	};
	OK.send(JSON.stringify(MES));
}
function RESrealtrades(data){
	console.log(data);	
}


function buy(price, amount){ OKspottrade("buy",price,amount); }
function sell(price, amount){ OKspottrade("sell",price,amount); }
function OKmarketbuy(price){
    var symbol = "btc_cny";
    var type = "buy_market";
    var sign = MD5("api_key="+api_key +
            "&price="+String(price) +
            "&symbol="+symbol +
            "&type="+type +
            "&secret_key="+secret_key);
    var MES = { 
        "event": "addChannel",
        "channel": "ok_spotcny_trade",
        "parameters" : { 
            "api_key" : api_key,
            "sign" : sign,
            "symbol" : symbol,
            "type" : type,
            "price" : price
        }   
    };  
    OK.send(JSON.stringify(MES));
}
function OKmarketsell(amount){
    var symbol = "btc_cny";
    var type = "sell_market";
    var sign = MD5("amount="+String(amount) +
            "&api_key="+api_key +
            "&symbol="+symbol +
            "&type="+type +
            "&secret_key="+secret_key);
    var MES = { 
        "event": "addChannel",
        "channel": "ok_spotcny_trade",
        "parameters" : { 
            "api_key" : api_key,
            "sign" : sign,
            "symbol" : symbol,
            "type" : type,
            "amount" : amount
        }
    };
    OK.send(JSON.stringify(MES));
}
function OKspottrade(type,price,amount){
	var symbol = "btc_cny";
	var sign = MD5("amount="+String(amount) +
			"&api_key="+api_key +
			"&price="+String(price) +
			"&symbol="+symbol +
			"&type="+type +
			"&secret_key="+secret_key);
	var MES = {
		"event": "addChannel",
		"channel": "ok_spotcny_trade",
		"parameters" : {
			"api_key" : api_key,
			"sign" : sign,
			"symbol" : symbol,
			"type" : type,
			"price" : price,
			"amount" : amount
		}
	};
	OK.send(JSON.stringify(MES));
}
function RESspottrade(data){
	//console.log(data);
}

function OKuserinfo() {
	var sign = MD5("api_key="+api_key +
			"&secret_key="+secret_key);
	var MES = {
		"event": "addChannel",
		"channel": "ok_spotcny_userinfo",
		"parameters" : {
			"api_key" : api_key,
			"sign" : sign
		}
	};
	OK.send(JSON.stringify(MES));
}
function RESuserinfo(data) {
	var funds = data.info.funds;
	var asset = funds.asset;
	var free = funds.free;
	var freezed = funds.freezed;
	flagOKBTC = 0;
	flagOKCNY = 0;
	//console.log(asset,free,freezed);
	OKcoinCNYfree = free.cny/1.0;
	OKcoinBTCfree = free.btc/1.0;
	OKcoinCNYfreezed = freezed.cny/1.0;
	OKcoinBTCfreezed = freezed.btc/1.0;
	OKcoinBTC = free.btc/1.0 + freezed.btc/1.0;
	OKcoinCNY = free.cny/1.0 + freezed.cny/1.0;
	if (OKcoinBTCfree > 3) flagOKBTC = 1;
	if (OKcoinCNYfree > 5000) flagOKCNY = 1;
	//console.log('flagOKCNY: ',flagOKCNY);
	//console.log('flagOKBTC: ',flagOKBTC);
	if (BTCCCNYfree + BTCCCNYfreezed + OKcoinCNY + RippleCNY - TotCNY > DWLimit){
		console.log(BTCCCNYfree + BTCCCNYfreezed + OKcoinCNY + RippleCNY - TotCNY,'more CNY');
		throw Error('too much CNY !!!');
	}
	if (BTCCCNYfree + BTCCCNYfreezed + OKcoinCNY + RippleCNY - TotCNY < -1 * DWLimit){
		console.log(BTCCCNYfree + BTCCCNYfreezed + OKcoinCNY + RippleCNY - TotCNY,'less CNY');
		throw Error('too few CNY !!!');
	}
	preOKcoinCNY = OKcoinCNY;
	//BTCCticker();
	getMarketDepth2();
	

}

function setOKorder(){
	var RippletradeFlag = 0;
	if (Math.abs(RippleCNY - preRippleCNY) > 100) RippletradeFlag = 1;
	if (RippletradeFlag === 0){
		if (Math.random() < 0.9) return 0;
	}
	var diffCNY = Math.floor(BTCCCNYfree + BTCCCNYfreezed + OKcoinCNY + RippleCNY - TotCNY);
	var amount;
	if (diffCNY > 0) {
		amount = Math.floor(diffCNY/(OKLast+3) * 1e3)/1e3;
	}else {
		amount = Math.ceil(diffCNY/(OKLast+3) * 1e3)/1e3;
	}
	//console.log("your CNY more than TotCNY for :", diffCNY);
	//console.log("then need to buy BTC :", amount);
	if (OKLast < 100 || OKLast > 10000) {
		console.log("okcoin price :",OKLast);
		throw Error("Impossible OKLast price !!!!!");
	}
	if (amount >= LimitAmount){
		//if (amount > tradeBTC) amount = tradeBTC;
		if (amount < OKcoinCNYfree/OKLast * 0.9) {
			amount = Math.floor(amount *1e4)/1e4;
			console.log("your CNY more than TotCNY for :", diffCNY);
			console.log("then need to buy BTC :", amount);
			if (amount > 0.01) {
				//console.log('less',amount,'BTC');
				//amount = LimitAmount * 5;
				if (amount > 0.1 && RippletradeFlag === 0) {
					amount = 0.1;
				}
				OKmarketbuy(Math.floor((OKcoinSellPrice+3)*amount*1e2)/1e2);
				console.log('adjust market buy',amount,'BTC in OKcoin');
			}
		}else if (amount < BTCCCNYfree/BTCCSellPrice * 0.9){
			amount = Math.floor(amount *1e4)/1e4;
			console.log("your CNY more than TotCNY for :", diffCNY);
			console.log("then need to buy BTC :", amount);
			if (amount > 0.002) {
				if (amount > 0.1 && RippletradeFlag === 0) {
					amount = 0.1;
				}
				BTCCmarketbuy(amount);
				console.log('adjust market buy',amount,'BTC in BTCC');
			}
		}
	}else if (amount <= (-1 * LimitAmount)){
		amount = - amount;
		//if (amount > tradeBTC) amount = tradeBTC;
		if (amount < OKcoinBTCfree){
			if (amount > 0.01) {
				//amount = LimitAmount * 5;
				if (amount > 0.1 && RippletradeFlag === 0){
					amount = 0.1;
				}
				OKmarketsell(amount);
				//sell(Last-0.5,amount);
				console.log('adjust market sell',amount,'BTC in OKcoin');
			}
		}else if (amount < BTCCBTCfree * 0.9){
			amount = Math.floor(amount *1e4)/1e4;
			if (amount > 0.002) {
				if (amount > 0.1 && RippletradeFlag === 0) {
					amount = 0.1;
				}
				BTCCmarketsell(amount);
				console.log('adjust market sell ',amount,'BTC in BTCC');
			}
		}
	}
	preRippleCNY = RippleCNY;
}


function messageOK(RES){
	//console.log('RES length:',RES.length);
	//console.log(RES);
	//console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
	//if (RES.hasOwnProperty("event")) {
		//console.log(RES.event);
		//if (RES.event === "pong") FlagOK = 1;
		//return;
	//}
	var mes = RES;
	if (mes.hasOwnProperty("channel")){
		var channel = mes.channel;
		var data = mes.data;
		//console.log(channel);
		if (channel === 'ok_sub_spotcny_btc_ticker') {
			RESticker(data);
		}else if (channel === 'ok_cny_realtrades') {
			RESrealtrades(data);
		}else if (channel === 'ok_spotcny_trade') {
			RESspottrade(data);
		}else if (channel === 'ok_spotcny_userinfo') {
			RESuserinfo(data);
		}else if (channel === 'ok_btccny_depth') {
			RESdepth(data);
		}else if (channel ==='ok_btccny_trades_v1') {
			REStrades(data);
		}
	}else if (mes.hasOwnProperty("errorcode")){
		if (mes.errorcode !== '10005') console.log('OKcoin ERROR:  ', mes.errorcode);
		//console.log('RES',RES);
	}else {
		console.log('Unexpected message:');
		console.log(RES);
		throw Error('Unexpected message');
	}
}
//var currentTest = new Date().getTime();


function RESaccount_lines(lines){
	flagRipple = 1;
	var line, myFund;
	var ChinaCNY = 0;
	var CnCNY = 0;
	var FoxCNY = 0;
	var FlagBalanceRippleBTC = 0;
	var FlagBalanceRippleCNY = 0;
	var FlagBalanceRippleJPY = 0;
	FlagBalanceRipple = 0;
	for (var i=0; i<lines.length; i++){
		line = lines[i];
		myFund = line.balance/1.0;
		if (line.account === gatewaySnapswap && line.currency === 'BTC'){
			RippleBTC = myFund;
			FlagBalanceRippleBTC = 1;
		}else if (line.account === gatewayRipplechina && line.currency === 'CNY'){
			ChinaCNY = myFund;
			FlagBalanceRippleCNY = 1;
		}else if (line.account === gatewayRipplecn && line.currency === 'CNY'){
			CnCNY = myFund;
			FlagBalanceRippleCNY = 1;
		}else if (line.account === gatewayRipplefox && line.currency === 'CNY'){
			FoxCNY = myFund;
			FlagBalanceRippleCNY = 1;
		}else if (line.account === gatewayTokyo && line.currency === 'JPY'){
			RippleJPY = myFund;
			if (RippleJPY > 1000000){
				rateSell = rate + 0.4;
			}else if (RippleJPY > 700000){
				rateSell = rate + 0.3;
			}else if (RippleJPY > 400000){
				rateSell = rate + 0.2;
			}else if (RippleJPY > 100000){
				rateSell = rate + 0.1;
			}
			if (rateSell < rateBuy) rateSell = rateBuy;
			FlagBalanceRippleJPY = 1;
		}
	}
	RippleCNY = CnCNY + ChinaCNY + FoxCNY + RippleJPY/rateSell;
	if (FlagBalanceRippleBTC === 1 && FlagBalanceRippleCNY === 1) {
		FlagBalanceRipple = 1;
	}else {
		throw Error('something wrong with ripple network !!!!');
	}
}
function account_lines(){
	var MES={
		"command": "account_lines",
		"account": MY_ADDRESS,
		"ledger_index": "validated"
	};
	Ripple.send(JSON.stringify(MES));
}


OK.on('message', function(message){
		var mes = JSON.parse(message);
		//console.log('mes:',mes);
		if (mes.length === 1) {
			mes = mes[0];
		}else{
			console.log('wrong mes:',mes);
		}
		//console.log(mes);
		if (mes.hasOwnProperty("data")){
			//var RES = mes.data;
			//var a = 0;
			//for (var f in RES){ a=1; break; }
			//if (a === 1) messageOK(RES);
			messageOK(mes);
		}else if (mes.hasOwnProperty("success")){
			//success response
		}else{
			//messageOK(mes);
			console.log('NO data & NO success:',message);
		}
		});
/*
Ripple.on('message', function(message){
        //console.log(message);
        var mes = JSON.parse(message);
        if (mes.hasOwnProperty("result")){
        var RES = mes.result;
        var a = 0;
        for (var f in RES){ a=1; break; }
        if (a === 1) {
        messageRipple(RES);
        }   
        } else{
        messageRipple(mes);
        }   
        }); 
*/
function messageRipple(RES){
	if (RES.hasOwnProperty("account_data")) {
		RESaccountInfo(RES.account_data);
	}else if (RES.hasOwnProperty("offers")) {
		if (RES.hasOwnProperty("account")) {
			Analyse(RES.offers);
		}else if(RES.hasOwnProperty("ledger_current_index")) {
			var length = RES.offers.length;
			//console.log(length);
			if (length !== 0){
				RESbookOffer(RES.offers);
			}
		}else {
			console.log("Unknown offer message");
			console.log(RES);
		}
	}else if (RES.hasOwnProperty("tx_json")) {
		if (RES.tx_json.TransactionType === "OfferCreate") {
			if (RES.engine_result === 'tesSUCCESS'){
				//console.log('offer created!');
			}else{
				//console.log('Something wrong when creating this offer!!! Error message:');
				//console.log(RES);
				//console.log(RES.engine_result_message);
			}
		}else if (RES.tx_json.TransactionType === "OfferCancel") {
			if (RES.engine_result === 'tesSUCCESS'){
				//console.log('offer cancelled!');
			}else{
				//console.log('Something wrong when cancelling this offer!!! Error message:');
				//console.log(RES);
				//console.log(RES.engine_result_message);
			}
		}
	}else if (RES.hasOwnProperty("transaction")){
		RESshowTransaction(RES.transaction);
	}else if (RES.hasOwnProperty("lines")){

		RESaccount_lines(RES.lines);
	}else if (RES.hasOwnProperty('error')){
		console.log('Error message:');
		console.log(RES.error_message);
	}else{
		console.log('Unexpected message:');
		console.log(RES);
		//throw Error('Unexpected message');
	}
}

var hex_chr = "0123456789ABCDEF"; 
function rhex(num) { 
	str = ""; 
	for(var j = 0; j <= 3; j++) 
		str += hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) + 
			hex_chr.charAt((num >> (j * 8)) & 0x0F); 
	return str; 
} 
function str2blks_MD5(str) { 
	nblk = ((str.length + 8) >> 6) + 1; 
	blks = new Array(nblk * 16); 
	for(var i = 0; i < nblk * 16; i++) blks[i] = 0; 
	for(i = 0; i < str.length; i++) 
		blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8); 
	blks[i >> 2] |= 0x80 << ((i % 4) * 8); 
	blks[nblk * 16 - 2] = str.length * 8; 
	return blks; 
} 
function add(x, y) { 
	var lsw = (x & 0xFFFF) + (y & 0xFFFF); 
	var msw = (x >> 16) + (y >> 16) + (lsw >> 16); 
	return (msw << 16) | (lsw & 0xFFFF); 
} 
function rol(num, cnt) { 
	return (num << cnt) | (num >>> (32 - cnt)); 
} 
function cmn(q, a, b, x, s, t) { 
	return add(rol(add(add(a, q), add(x, t)), s), b); 
} 
function ff(a, b, c, d, x, s, t) { 
	return cmn((b & c) | ((~b) & d), a, b, x, s, t); 
} 
function gg(a, b, c, d, x, s, t) { 
	return cmn((b & d) | (c & (~d)), a, b, x, s, t); 
} 
function hh(a, b, c, d, x, s, t) { 
	return cmn(b ^ c ^ d, a, b, x, s, t); 
} 
function ii(a, b, c, d, x, s, t) { 
	return cmn(c ^ (b | (~d)), a, b, x, s, t); 
} 
function MD5(str) { 
	x = str2blks_MD5(str); 
	var a = 1732584193; 
	var b = -271733879; 
	var c = -1732584194; 
	var d = 271733878; 
	for(i = 0; i < x.length; i += 16) { 
		var olda = a; 
		var oldb = b; 
		var oldc = c; 
		var oldd = d; 
		a = ff(a, b, c, d, x[i+ 0], 7 , -680876936); 
		d = ff(d, a, b, c, x[i+ 1], 12, -389564586); 
		c = ff(c, d, a, b, x[i+ 2], 17, 606105819); 
		b = ff(b, c, d, a, x[i+ 3], 22, -1044525330); 
		a = ff(a, b, c, d, x[i+ 4], 7 , -176418897); 
		d = ff(d, a, b, c, x[i+ 5], 12, 1200080426); 
		c = ff(c, d, a, b, x[i+ 6], 17, -1473231341); 
		b = ff(b, c, d, a, x[i+ 7], 22, -45705983); 
		a = ff(a, b, c, d, x[i+ 8], 7 , 1770035416); 
		d = ff(d, a, b, c, x[i+ 9], 12, -1958414417); 
		c = ff(c, d, a, b, x[i+10], 17, -42063); 
		b = ff(b, c, d, a, x[i+11], 22, -1990404162); 
		a = ff(a, b, c, d, x[i+12], 7 , 1804603682); 
		d = ff(d, a, b, c, x[i+13], 12, -40341101); 
		c = ff(c, d, a, b, x[i+14], 17, -1502002290); 
		b = ff(b, c, d, a, x[i+15], 22, 1236535329); 
		a = gg(a, b, c, d, x[i+ 1], 5 , -165796510); 
		d = gg(d, a, b, c, x[i+ 6], 9 , -1069501632); 
		c = gg(c, d, a, b, x[i+11], 14, 643717713); 
		b = gg(b, c, d, a, x[i+ 0], 20, -373897302); 
		a = gg(a, b, c, d, x[i+ 5], 5 , -701558691); 
		d = gg(d, a, b, c, x[i+10], 9 , 38016083); 
		c = gg(c, d, a, b, x[i+15], 14, -660478335); 
		b = gg(b, c, d, a, x[i+ 4], 20, -405537848); 
		a = gg(a, b, c, d, x[i+ 9], 5 , 568446438); 
		d = gg(d, a, b, c, x[i+14], 9 , -1019803690); 
		c = gg(c, d, a, b, x[i+ 3], 14, -187363961); 
		b = gg(b, c, d, a, x[i+ 8], 20, 1163531501); 
		a = gg(a, b, c, d, x[i+13], 5 , -1444681467); 
		d = gg(d, a, b, c, x[i+ 2], 9 , -51403784); 
		c = gg(c, d, a, b, x[i+ 7], 14, 1735328473); 
		b = gg(b, c, d, a, x[i+12], 20, -1926607734); 
		a = hh(a, b, c, d, x[i+ 5], 4 , -378558); 
		d = hh(d, a, b, c, x[i+ 8], 11, -2022574463); 
		c = hh(c, d, a, b, x[i+11], 16, 1839030562); 
		b = hh(b, c, d, a, x[i+14], 23, -35309556); 
		a = hh(a, b, c, d, x[i+ 1], 4 , -1530992060); 
		d = hh(d, a, b, c, x[i+ 4], 11, 1272893353); 
		c = hh(c, d, a, b, x[i+ 7], 16, -155497632); 
		b = hh(b, c, d, a, x[i+10], 23, -1094730640); 
		a = hh(a, b, c, d, x[i+13], 4 , 681279174); 
		d = hh(d, a, b, c, x[i+ 0], 11, -358537222); 
		c = hh(c, d, a, b, x[i+ 3], 16, -722521979); 
		b = hh(b, c, d, a, x[i+ 6], 23, 76029189); 
		a = hh(a, b, c, d, x[i+ 9], 4 , -640364487); 
		d = hh(d, a, b, c, x[i+12], 11, -421815835); 
		c = hh(c, d, a, b, x[i+15], 16, 530742520); 
		b = hh(b, c, d, a, x[i+ 2], 23, -995338651); 
		a = ii(a, b, c, d, x[i+ 0], 6 , -198630844); 
		d = ii(d, a, b, c, x[i+ 7], 10, 1126891415); 
		c = ii(c, d, a, b, x[i+14], 15, -1416354905); 
		b = ii(b, c, d, a, x[i+ 5], 21, -57434055); 
		a = ii(a, b, c, d, x[i+12], 6 , 1700485571); 
		d = ii(d, a, b, c, x[i+ 3], 10, -1894986606); 
		c = ii(c, d, a, b, x[i+10], 15, -1051523); 
		b = ii(b, c, d, a, x[i+ 1], 21, -2054922799); 
		a = ii(a, b, c, d, x[i+ 8], 6 , 1873313359); 
		d = ii(d, a, b, c, x[i+15], 10, -30611744); 
		c = ii(c, d, a, b, x[i+ 6], 15, -1560198380); 
		b = ii(b, c, d, a, x[i+13], 21, 1309151649); 
		a = ii(a, b, c, d, x[i+ 4], 6 , -145523070); 
		d = ii(d, a, b, c, x[i+11], 10, -1120210379); 
		c = ii(c, d, a, b, x[i+ 2], 15, 718787259); 
		b = ii(b, c, d, a, x[i+ 9], 21, -343485551); 
		a = add(a, olda); 
		b = add(b, oldb); 
		c = add(c, oldc); 
		d = add(d, oldd); 
	} 
	return rhex(a) + rhex(b) + rhex(c) + rhex(d); 
}  
