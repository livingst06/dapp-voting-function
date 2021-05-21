const { BN, ether } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')
const Voting = artifacts.require('Voting')
contract('Voting', function (accounts) {
	const _decimals = new BN(18)
	const owner = accounts[0]
	const voter1 = accounts[1]
	const voter2 = accounts[2]

	beforeEach(async function () {
		this.VotingInstance = await Voting.new({ from: owner })
	})

	it('Smart Contract Voting s owner is the first account of metamask wallet', async function () {
		expect(await this.VotingInstance.owner()).to.equal(owner)
	})

	/********************************** */
	/********************************** */
	/********************************** */

	it('initial state of Smart Contract Voting has to be RegisteringVoters', async function () {
		expect(await this.VotingInstance.getWorkFlowStatus()).to.equal(
			'RegisteringVoters'
		)
	})

	it('at beginning there is no proposals', async function () {
		expect(await this.VotingInstance.getProposals()).to.have.lengthOf(0)
	})

	return

	it('a un symbole', async function () {
		expect(await this.VotingInstance.symbol()).to.equal(_symbol)
	})
	it('a une valeur décimal', async function () {
		expect(await this.VotingInstance.decimals()).to.be.bignumber.equal(
			_decimals
		)
	})
	it('vérifie la balance du propriétaire du contrat', async function () {
		let balanceOwner = await this.VotingInstance.balanceOf(owner)
		let totalSupply = await this.VotingInstance.totalSupply()
		expect(balanceOwner).to.be.bignumber.equal(totalSupply)
	})
	it('vérifie si un transfer est bien effectué', async function () {
		let balanceOwnerBeforeTransfer = await this.VotingInstance.balanceOf(owner)
		let balanceRecipientBeforeTransfer = await this.VotingInstance.balanceOf(
			recipient
		)
		let amount = new BN(10)
		await this.VotingInstance.transfer(recipient, amount, { from: owner })
		let balanceOwnerAfterTransfer = await this.VotingInstance.balanceOf(owner)
		let balanceRecipientAfterTransfer = await this.VotingInstance.balanceOf(
			recipient
		)

		expect(balanceOwnerAfterTransfer).to.be.bignumber.equal(
			balanceOwnerBeforeTransfer.sub(amount)
		)
		expect(balanceRecipientAfterTransfer).to.be.bignumber.equal(
			balanceRecipientBeforeTransfer.add(amount)
		)
	})
})
