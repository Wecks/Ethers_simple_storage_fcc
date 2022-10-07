const ethers = require("ethers");
const fs = require("fs-extra");
require("dotenv").config();

async function main() {
  //http://127.0.0.1:8545
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  // const encryptedJson = fs.readFileSync("./.encryptedKey.json", "utf8");
  // let wallet = new ethers.Wallet.fromEncryptedJsonSync(
  //   encryptedJson,
  //   process.env.PRIVATE_KEY_PASSWORD
  // );
  // wallet = await wallet.connect(provider); 

  // With this part above of the code we don't need to store our PRIVATE KEY in the .env file
  // and we have an encryptedKey thanks to our js script "encryptKey.js"
  // We neeed to add the password when deployind the smart contract : 
  // PRIVATE_KEY_PASSWORD=password node deploy.js
  // After that to be 100% secure we need to clean the history of our console with :
  // history -c , otherwise if someone have acces to our computer it can see the password in the history

  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf8");
  const binary = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.bin", "utf8");
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log("Deploying, please wait...");
  const contract = await contractFactory.deploy(/*{gasPrice: 1000 }*/); // On peut ajouter des paremetres au deploiement 
  await contract.deployTransaction.wait(1);
  console.log(`COntract Address: ${contract.address}`);

  const currentFavoriteNumber = await contract.retrieve();
  console.log(`Current Favorite Number : ${currentFavoriteNumber.toString()}`);
  const transactionResponse = await contract.store("7");
  const transactionReceipt = await transactionResponse.wait(1);
  const updatedFavoriteNumber = await contract.retrieve();
  console.log(`Updated favorite number is: ${updatedFavoriteNumber}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
