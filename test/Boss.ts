import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers,network } from "hardhat";
import { ZeroAddress } from "ethers";

describe("Boss", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployBossFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;


    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();
    
    const Boss = await ethers.getContractFactory("Boss");
    const boss = await Boss.deploy(owner,"Boss", "BOSS", owner,0,owner,ZeroAddress);

    return { boss, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should deploy", async function () {
      const { boss, owner } = await loadFixture(deployBossFixture);
      expect(boss).is.not.null;
    });

    it("Can sign eip712",async function name() {
      const { boss, owner,otherAccount } = await loadFixture(deployBossFixture);
      const networkId =await network.provider.send('eth_chainId');
      const domain = {
        name: "BossERC1155",
        version: "1",
        chainId: networkId,
        verifyingContract: await boss.getAddress(),
      };
      /*
        struct AttackRequest {
            uint256 tokenId;
            uint256 quantity;
            address user;
            bytes32 uid;
        }
      */
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
        user:otherAccount.address,
        uid: ethers.randomBytes(32)
      };
      const signature = await owner.signTypedData(domain,types,attackRequest);
      console.log("typescript signer address:",owner.address);
      const tx = await boss.attackWithSignature(attackRequest,signature)
      const receipt = await tx.wait()
      expect(receipt.status).to.eq(1);
    })

    it("Can reject non owner eip712",async function name() {
      const { boss, owner,otherAccount } = await loadFixture(deployBossFixture);
      const networkId =await network.provider.send('eth_chainId');
      const domain = {
        name: "BossERC1155",
        version: "1",
        chainId: networkId,
        verifyingContract: await boss.getAddress(),
      };
      /*
        struct AttackRequest {
            uint256 tokenId;
            uint256 quantity;
            address user;
            bytes32 uid;
        }
      */
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
        user:otherAccount.address,
        uid: ethers.randomBytes(32)
      };
      const signature = await otherAccount.signTypedData(domain,types,attackRequest);
      console.log("typescript signer address:",otherAccount.address);
      
      await expect(boss.attackWithSignature(attackRequest,signature))
        .to.be.revertedWith('unauthorized command');
      
    })
  });

});