# Journal brut des contrôles — Espace Kignon (UTC)

## 2026-10-19 17:19
https://www.espacekignon.com/ -> échec : tunnel CONNECT 502 (proxy) ; la passerelle signale 'policy denial or upstream failure'
https://espacekignon.com/   -> SSL: no alternative certificate subject name matches target host name 'espacekignon.com'
http://www.espacekignon.com/ -> curl: (6) Could not resolve host: www.espacekignon.com
WebFetch https://www.espacekignon.com/ -> getaddrinfo ENOTFOUND www.espacekignon.com (service distinct)

## 2026-10-19 17:21
getent ahosts www.espacekignon.com -> (vide)
getent ahosts espacekignon.com -> 45.94.36.34
certificat présenté par https://espacekignon.com/ : subject CN=de-free.fxccc.cc, expire le 6 déc. 2026
http://espacekignon.com/ -> HTTP/1.1 503 Service Unavailable
  corps : upstream connect error or disconnect/reset before headers. retried and the latest reset reason: remote connection failure

## 2026-10-19 17:55 (seconde série)
www.espacekignon.com DNS: aucune résolution
espacekignon.com DNS: 45.94.36.34
https www: code=000
http nu: code=503
*  subject: CN=de-free.fxccc.cc
* SSL: no alternative certificate subject name matches target host name 'espacekignon.com'
