ssh-keygen -t rsa -b 4096 -C "dieutuyetnguyenthi@gmail.com"

eval "$(ssh-agent -s)"

ssh-add ~/.ssh/id_rsa

cat ~/.ssh/id_rsa.pub

->> copy to clipboard

GitHub.com → Click avatar → Settings


git remote add origin git@github.com:toandk2003/chat-service-express.git


