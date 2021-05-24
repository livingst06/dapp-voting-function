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
		expect(await this.VotingInstance.getWorkFlowStatus()).to.equal('RegisteringVoters')
	})

	it('at beginning there is no proposals', async function () {
		expect(await this.VotingInstance.getProposals()).to.have.lengthOf(0)
	})

	it('at beginning there is no authorized voters in whitelist', async function () {
		expect(await this.VotingInstance.getAdresses()).to.have.lengthOf(0)
	})

	it('at registeringVoter status , owner can add voter 1 in whitelist', async function () {
		expect(await this.VotingInstance.getAdresses()).to.have.lengthOf(0)
		await this.VotingInstance.startRegisteringVoters()
		await this.VotingInstance.registerVoter(voter1, { from: owner })
		expect(await this.VotingInstance.getAdresses()).to.have.lengthOf(1)
	})

	it('an authorized account can make a proposal', async function () {
		await this.VotingInstance.startRegisteringVoters()
		await this.VotingInstance.registerVoter(voter1, { from: owner })
		await this.VotingInstance.startProposalRegistration()
		await this.VotingInstance.giveProposal('mike Tyson', { from: voter1 })

		expect(await this.VotingInstance.getProposals()).to.have.lengthOf(1)
	})

	it('an authorized account can vote for a registered proposal', async function () {
		await this.VotingInstance.startRegisteringVoters()
		await this.VotingInstance.registerVoter(voter1, { from: owner })
		await this.VotingInstance.startProposalRegistration()
		await this.VotingInstance.giveProposal('mike Tyson', { from: voter1 })

		expect(await this.VotingInstance.getProposals()).to.have.lengthOf(1)
	})

	it('The proposal that received the most votes wins', async function () {
		await this.VotingInstance.startRegisteringVoters()
		await this.VotingInstance.registerVoter(voter1, { from: owner })
		await this.VotingInstance.registerVoter(voter2, { from: owner })

		await this.VotingInstance.startProposalRegistration()
		await this.VotingInstance.giveProposal('trump', { from: voter1 })
		await this.VotingInstance.giveProposal('biden', { from: voter2 })

		await this.VotingInstance.startVotingSession()
		await this.VotingInstance.vote(1, { from: voter1 })
		await this.VotingInstance.vote(1, { from: voter2 })

		expect(await this.VotingInstance.getProposals()).to.have.lengthOf(2)
		expect(await this.VotingInstance.winnerName()).to.equal('biden')
	})
})
