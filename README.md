# wificoin-wifidog-auth-server
wwas is a apfree wifidog auther server (it also support original wifidog), which especially supporting wfc payment to surf internet.

## how to run server side

```
git clone https://github.com/wificoin-project/wificoin-wifidog-auth-server

cd wificoin-wifidog-auth-server

npm install 

npm run dev

```

## how to run apfree wifidog side

the config of apfree wifidog in openwrt is the following:

```
config wifidog
	option	gateway_interface	'br-lan'
	option	auth_server_hostname	'wifidog.kunteng.org.cn'
	option	auth_server_port	8001
	option	auth_server_path	'/wifidog/'	
	option	check_interval		60
	option	client_timeout		72000
	option	httpd_max_conn		200
	option	pool_mode			1
	option	thread_number		5
	option	queue_size			20
	option	wired_passed		0
	option	enable		1

config mqtt	'mqtt'
  	option	mqtt_hostname	'wifidog.kunteng.org.cn'
  	option	mqtt_port		'8883'
  	option	mqtt_topic		''

```

u can change 'wifidog.kunteng.org.cn' to your own wifidog auth server domain

## contact us
qq group: 424031785
star our project and support us
