defaults
auth
auth           on
tls            on
tls_trust_file /etc/ssl/cert.pem
logfile        ~/.msmtp.log

account gmail
host smtp.gmail.com
port 587
from kathleenlarue001@gmail.com
user kathleenlarue001@gmail.com
password cyhg hxcr nugz kkxy

account default : gmail
