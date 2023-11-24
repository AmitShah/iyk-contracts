// contracts/MyNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@thirdweb-dev/contracts/base/ERC1155Drop.sol";
import "@thirdweb-dev/contracts/base/ERC20Base.sol";
import "@thirdweb-dev/contracts/external-deps/openzeppelin/utils/cryptography/EIP712.sol";
import "hardhat/console.sol";

contract Boss is ERC1155Drop,EIP712 {
    using ECDSA for bytes32;
        struct AttackRequest {
            uint256 tokenId;
            uint256 quantity;
            address user;
            bytes32 uid;
        }

        mapping(uint256 => uint256) public hitpoints;
        mapping(bytes32=>bool) public _nonce;
        ERC20Base hp;
          bytes32 internal constant TYPEHASH =
        keccak256(
            "AttackRequest(uint256 tokenId,uint256 quantity,address user,bytes32 uid)"
        );


        constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol,
        address _royaltyRecipient,
        uint128 _royaltyBps,
        address _primarySaleRecipient,
        address _hp) ERC1155Drop(_defaultAdmin,
        _name,
        _symbol,
        _royaltyRecipient,
         _royaltyBps,
          _primarySaleRecipient) EIP712("BossERC1155", "1") {
                  hp = ERC20Base(_hp);
        }

/*
 address _receiver,
        uint256 _tokenId,
        uint256 _quantity,
        address _currency,
        uint256 _pricePerToken,
        AllowlistProof calldata _allowlistProof,
        bytes memory _data
    ) public payable virtual override {
        _beforeClaim(_tokenId, _receiver, _quantity, _currency, _pricePerToken, _allowlistProof, _data);
*/
    function claim(
        address _receiver,
        uint256 _tokenId,
        uint256 _quantity,
        address _currency,
        uint256 _pricePerToken,
        AllowlistProof calldata _allowlistProof,
        bytes memory _data
    ) public payable virtual override {
            //TODO extend this to mint 
        uint256 health = 666;
        hitpoints[_tokenId] = health;
        super.claim( _receiver,_tokenId, _quantity, _currency, _pricePerToken, _allowlistProof, _data);
        hp.mintTo(address(this),health);
    }

    function attackWithSignature(AttackRequest calldata _req, bytes calldata _signature)
        external
        payable
        virtual        
        returns (address signer)
    {
        //attackAmount = IEnumerable ERC1155 items.multiplier
       //pass in eip712 object signed by owner that hp.transfer(userAddress,attackAmount)
       require(_nonce[_req.uid]==false, "_nonce already used");
       signer = _recoverAddress(_req, _signature);
       console.log("recovered signer:",signer);
       require(signer == owner(), "unauthorized command");
        uint attack = 66;
    //    for (uint256 i=0;i<3; i++){
    //        attack+= this.balanceOf(_req.user,i); //.balanceOf[_req.user][i];
    //    }
       console.log("attack:",attack);
       console.log("hitpoints:",hitpoints[_req.tokenId]);
        if(hitpoints[_req.tokenId] < attack){
            hitpoints[_req.tokenId]= 0;
        }else{
            hitpoints[_req.tokenId]= attack;
        }
        _nonce[_req.uid] = true;
        if(address(hp) != address(0)){
            hp.transfer(_req.user,attack);

        }
       return signer;
    }

    function _recoverAddress(AttackRequest calldata _req, bytes calldata _signature) internal view returns (address) {
        return _hashTypedDataV4(keccak256(_encodeRequest(_req))).recover(_signature);
    }

    /// @dev Resolves 'stack too deep' error in `recoverAddress`.
    function _encodeRequest(AttackRequest calldata _req) internal pure returns (bytes memory) {
        return
                abi.encode(
                    TYPEHASH,
                    _req.tokenId,
                    _req.quantity,
                    _req.user,
                    _req.uid
                );
    }
    
}
 