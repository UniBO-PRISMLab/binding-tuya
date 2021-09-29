# Configuration of WoT Servient

Usando tsc (e npm install) si compila il progetto e scaricano tutte le dipendenze.
Nella cartella corrente trova solo un server base che legge un TD e ne crea una thing (lampadina) oltre al file reader.ts che accende o spegne la lampadina.
la tuya-cli funziona esattamente come tutte le altre cli e per comodità può usare il file config.json come file di configurazione.
Oltre ai soliti campi il file di configurazione ha bisogno delle credenziali per l'accesso alle api, che spiegherò poi come ottenere.

Il file TD.json è il file contenente il TD, può crearne uno personalizzato come preferisce ma sono necessari due campi extra che utilizzo per comunicare al server: id e region, id è il l'id che tuya da alla thing una volta collegata al suo account e region è la regione dei server da contattare, nel suo caso eu va benissimo. Dopo averlo modificato lo inserisca nella stessa cartella che contiente il file cli-tuya-servient.js

Ogni file è commentato nelle parti critiche quindi qua sto abbastanza sul vago

Gli altri file che utilizzo / ho modificato sono:
in packages/binding-http ho modificato credential.ts per aggiungere il metodo di firma di tuya per le chiamate.
http-client.ts per aggiungere a setsecurity il metodo tuya aggiunto in credential

in packages/binding-tuya ho aggiunto:
un servient che sfrutta la TuyaWotImplementation per creare thing.
la TuyaWotImplementation che al posto di usare normali exposedThing usa le tuya-thing.
thing che estende le tuya-thing per bypassare i dati locali e leggere quelli remoti.

Per ottenere le credenziali tuya:
andare al link: https://iot.tuya.com/ e registrarsi, creare poi un nuovo progetto cloud aggiungendo le API "Smart Home Devices Management"
dopodichè andare nella sezione devices e aggiungere devices usando l'opzione che sfrutta l'applicazione su smartphone, comparirà un qr code che si può scannerizzare dall'app per autorizzare tutti i device registrati che dovrebbero poi essere visibili nel menù. A quel punto copiare l'id del device che si vuole usare e aggiungerlo al TD. Le istruzioni non sono particolarmente dettagliate perchè da quando l'ho fatto la prima volta il sito è già cambiato 2 volte ma non dovrebbe essere impossibile navigarlo.

P.s. se si vuole giocare con le API la sezione "API Explorer" è fatta decentemente.
P.s.s. A volte i server tuya sono lenti ad aggiornare le informazioni e quindi capita che se si fa una modifica e subito dopo si tenta di leggere il dato venga ancora visualizzato il precedente.
