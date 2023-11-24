import { ethers } from "ethers";
import abi from "./ABI.json";
import dotenv from 'dotenv'; 
dotenv.config(); 


(async ()=>{
    console.log(abi);
    const wallet = new ethers.Wallet(process.env.SIGNING_PK as string,new ethers.JsonRpcProvider("https://goerli.base.org"))
    
    let Boss = new ethers.Contract(process.env.BOSS_ADDRESS as string,abi);
    
    const boss = Boss.connect(wallet)
    const domain = {
        name: "BossERC1155",
        version: "1",
        chainId: (await wallet.provider?.getNetwork())?.chainId,
        verifyingContract: await boss.getAddress(),
      };
 
      const types = {
        AttackRequest: [
          { name: "tokenId", type: "uint256" },
          { name: "quantity", type: "uint256" },
          { name: "user", type: "address" },
          { name: "uid", type: "bytes32" },
        ],
      };
      const attackRequest = {
        tokenId: 0,
        quantity:50,
        user:ethers.Wallet.createRandom().address,
        uid: ethers.hexlify(ethers.randomBytes(32))
      };
      const signature = await wallet.signTypedData(domain,types,attackRequest);
      console.log("typescript signer address:",wallet.address);
      const tx = await (boss as any).attackWithSignature(attackRequest,signature)
      const receipt = await tx.wait();
      console.log(receipt);
})()