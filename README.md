# dapp-voting

## install
npm install @openzeppelin/contracts
## compile
truffle compile --all
## migrate
truffle migrate
## install dapp side
cd client;npm install
## run client
npm start
## to deploy on heroku
## 
go to the root folder of your project
##
heroku login -i
##
heroku create --buildpack mars/create-react-app my-project
##
git subtree push --prefix client/ heroku master
