const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const hre = require("hardhat");

describe('Faucet', function () {
  async function deployContractAndSetVariables() {
    const Faucet = await ethers.getContractFactory('Faucet');

    const faucet = await Faucet.deploy();

    const [owner, anotherAccount] = await ethers.getSigners();

    const withdrawAmount = ethers.utils.parseUnits('1', 'ether');

    return { faucet, owner, withdrawAmount, anotherAccount };
  }

  it('should deploy and set the owner correctly', async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.owner()).to.equal(owner.address);
  });

  it('should not allow withdrawals above .1 ETH at a time', async function () {
    const { faucet, withdrawAmount } = await loadFixture(
      deployContractAndSetVariables
    );
    await expect(faucet.withdraw(withdrawAmount)).to.be.reverted;
  });

  it('should only allow the owner to destroy the faucet && Check if the contract has been destroyed', async function () {
    const { faucet, owner, anotherAccount } = await loadFixture(deployContractAndSetVariables);
  
    const isOwner = (await faucet.owner()) == owner.address;

    const isNotOwner = (await faucet.owner()) != anotherAccount.address;
    
    expect(isOwner).to.equal(true);

    expect(isNotOwner).to.equal(true);
  
    await expect(faucet.connect(anotherAccount).destroyFaucet()).to.be.reverted;
  
    await faucet.connect(owner).destroyFaucet();

    const codeAfterDestruction = await hre.ethers.provider.getCode(faucet.address);
    
    expect(codeAfterDestruction).to.equal('0x');
  });

  it('should only allow the owner to call the withdrawAll function && check if he can withdraw all the ETH', async function () {
    const { faucet, owner, anotherAccount } = await loadFixture(deployContractAndSetVariables);
  
    await expect(faucet.connect(anotherAccount).withdrawAll()).to.be.reverted;
  
    await expect(faucet.connect(owner).withdrawAll()).to.not.be.reverted;

  });
});