import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import React, { Component } from 'react'
import {ButtonGroup,ToggleButton} from 'react-bootstrap'

import Voting from './contracts/Voting.json'
import getWeb3 from './getWeb3'
import TheNavbar from './components/TheNavbar'
import AuthorizedAccounts from './components/AuthorizedAccounts'
import ListProposals from './components/ListProposals'
import MakeProposal from './components/MakeProposal'
import AuthorizeAccount from './components/AuthorizeAccount'
import VoteFor from './components/VoteFor'
import TheWinnerBox from './components/TheWinnerBox'

class App extends Component {
	state = {
		web3: null,
		account: null,
		contract: null,
		owner: null,
		wfs: null,
		adresses: [],
		proposals: [],
		loading: null,
	}

	componentDidMount = async () => {
		try {
			// Get network provider and web3 instance.
			const web3 = await getWeb3()

			// set the current account
			const accounts = await web3.eth.getAccounts()

			// Get the contract instance.
			const networkId = await web3.eth.net.getId()
			const deployedNetwork = Voting.networks[networkId]
			const contract = new web3.eth.Contract(
				Voting.abi,
				deployedNetwork && deployedNetwork.address
			)

			const owner = await contract.methods.owner().call()


			// récupérer le statut etat du vote et le mettre dans le state
			const wfs = await contract.methods.getWorkFlowStatus().call()




			//subscribe to event Voted
			contract.events.WorkflowStatusChange(
				{
					fromBlock: web3.eth.getBlock('latest').number,
				},
				function (error, event) {
					//console.log('event after voted',event)
				}
			)
			.on('connected', function (subscriptionId) {})
			.on('data', (event) => this.handleWfsChange(event))
			.on('changed', function (event) {
					// remove event from local database
			})
			.on('error', function (error, receipt) {
					// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
					console.log('on error', receipt) // same results as the optional callback above
			})




			this.setState({web3, accounts, wfs, account: accounts[0], contract, owner})


		} catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				`Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`
			)
			console.error(error)
			this.setState({ loading: false })
		}
	}

	handleWfsChange = (event) => {
		
		switch (parseInt(event.returnValues.newStatus)) {
			case 0:
				this.setState({ wfs: 'RegisteringVoters' })
				break
			case 1:
				this.setState({ wfs: 'ProposalsRegistrationStarted' })
				break
			case 2:
				this.setState({ wfs: 'ProposalsRegistrationEnded' })
				break
			case 3:
				this.setState({ wfs: 'VotingSessionStarted' })
				break
			case 4:
				this.setState({ wfs: 'VotingSessionEnded' })
				break
			case 5:
				this.setState({ wfs: 'VotesTallied' })
				break
			default:
				break
		}

	}


	updateProposals = (event) => {
		const { proposals } = this.state

		proposals[event.returnValues.proposalId].voteCount++
		this.setState({ proposals })
	}

	radios = [
		{
			name: 'Enregistrement des votants',
			value: 'RegisteringVoters',
		},
		{
			name: 'Demarrer enregistrement des propositions',
			value: 'ProposalsRegistrationStarted',
		},
		{
			name: 'arreter enregistrement des propositions',
			value: 'ProposalsRegistrationEnded',
		},
		{
			name: 'Vote en cours',
			value: 'VotingSessionStarted',
		},
		{ name: 'Vote Terminé', value: 'VotingSessionEnded' },
		{
			name: 'Designation du gagnant',
			value: 'VotesTallied',
		},
	]

	handleToggleChange = async (event) => {
		// Only owner of the contract can change this toggle.
		// other users can only see toggle position but cannot change it.
		if (this.state.account !== this.state.owner) return

		const targetting = event.currentTarget.value

		try {
			this.setState({ loading: true })

			await this.updateVotingProcess(targetting)

			this.setState({ wfs: targetting, loading: false })
		} catch (error) {
			// Remettre le toggle a previous
			//document.getElementById('radioToggle').value = previous
			this.setState({ loading: false })
		}
	}

	registerVoter = async (address) => {
		// Interaction avec le smart contract pour ajouter un compte
		await this.state.contract.methods
			.registerVoter(address)
			.send({ from: this.state.account })
	}

	updateVotingProcess = async (status) => {
		// Interaction avec le smart contract pour changer statuts du process de voting

		switch (status) {
			case 'RegisteringVoters':
				await this.state.contract.methods
					.startRegisteringVoters()
					.send({ from: this.state.account })
				break
			case 'ProposalsRegistrationStarted':
				await this.state.contract.methods
					.startProposalRegistration()
					.send({ from: this.state.account })
				break
			case 'ProposalsRegistrationEnded':
				await this.state.contract.methods
					.stopProposalRegistration()
					.send({ from: this.state.account })
				break
			case 'VotingSessionStarted':
				await this.state.contract.methods
					.startVotingSession()
					.send({ from: this.state.account })
				break
			case 'VotingSessionEnded':
				await this.state.contract.methods
					.stopVotingSession()
					.send({ from: this.state.account })
				break
			case 'VotesTallied':
				// Afficher le div qui affiche le gagnant
				await this.state.contract.methods
					.votesTallied()
					.send({ from: this.state.account })
				break
			default:
				break
		}
	}


	giveProposal = async (descr) => {
		// Interaction avec le smart contract pour ajouter un compte
		await this.state.contract.methods
			.giveProposal(descr)
			.send({ from: this.state.account })
	}

	render() {
		const { web3, owner, account, contract, wfs, loading } = this.state

		if (!web3) {
			return <div>please connect to metamask</div>
		}


		if (loading) {
			return <div>loading...</div>
		}

		return (
			<div className="App">
				<TheNavbar account={account} />

				<ButtonGroup toggle>
					{this.radios.map((radio, idx) => (
						<ToggleButton
							key={idx}
							type="radio"
							variant={wfs === radio.value ? 'success' : 'secondary'}
							name="radioToggle"
							value={radio.value}
							checked={wfs === radio.value}
							disabled={owner !== account}
							onChange={this.handleToggleChange}
						>
							{radio.name}
						</ToggleButton>
					))}
				</ButtonGroup>

				<br></br>
				<br></br>
				{owner === account && wfs === 'RegisteringVoters' ?(<AuthorizedAccounts web3={web3} contract={contract} />):(<div></div>)}
				{owner !== account && wfs === 'RegisteringVoters' ?(<div>waiting for register your proposal --&gt;&gt;&gt;&gt; </div>):(<div></div>)}
				<br></br>
				{wfs !== 'RegisteringVoters' ?<ListProposals web3={web3} contract={contract} />:''}
				<br></br>
				{owner === account && wfs === 'RegisteringVoters' ?	<AuthorizeAccount registerVoter={this.registerVoter} />:''}
				<br></br>
				{wfs === 'ProposalsRegistrationStarted' ? <MakeProposal giveProposal={this.giveProposal} />:''}
				<br></br>
				{wfs === 'VotingSessionStarted' ? <VoteFor web3={web3} contract={contract} account={account}/>:''}
				<br></br>
				{wfs === 'VotesTallied' ? <TheWinnerBox contract={contract} />:''}
			</div>
		)
	}
}

export default App
