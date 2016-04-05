#!/usr/bin/python3.4
import sys
import json
import time
import OkcoinSpotAPI
from OkcoinSpotAPI import OKCoinSpot
apikey = ""
secretkey = ""

okcoinRESTURL = 'www.okcoin.cn'
okcoinSpot = OKCoinSpot(okcoinRESTURL,apikey,secretkey)
trade_pwd = ""
if sys.argv[1] == 'BTCC':
    withdraw_address = ""
elif sys.argv[1] == 'Ripple':
    withdraw_address = ""
withdraw_amount = sys.argv[2]
print (okcoinSpot.withdraw('btc_cny','0.0001',trade_pwd,withdraw_address,withdraw_amount))
exit(0)
