import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'

import React, { useState, useEffect } from 'react'
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

function App() {
	
	const [ web3, setWeb3] 			= useState(null)
	const [ account, setAccount] 	= useState(null)
	const [ contract, setContract] 	= useState(null)
	const [ owner, setOwner] 		= useState(null)
	const [ wfs, setWfs] 			= useState(null)
	const [ loading, setLoading]	= useState(true)
	const [ ws, setWs]				= useState(null)
 
	useEffect(() => {
		init()

		return () => {

			if ( !ws) return
			
			ws.unsubscribe()

		}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
 
	useEffect(() => {
		 
		if ( !ws) return

		ws.on('data', (event) => handleWfsChange(event))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ws])

	const init = async () => {
				
		try {
			// Get network provider and web3 instance.
			const _web3 = await getWeb3()

			// set the current account
			const _accounts = await _web3.eth.getAccounts()

			// Get the contract instance.
			const networkId = await _web3.eth.net.getId()
			const deployedNetwork = Voting.networks[networkId]
			const _contract = new _web3.eth.Contract(
				Voting.abi,
				deployedNetwork && deployedNetwork.address
			)

			const _owner = await _contract.methods.owner().call()


			// récupérer le statut etat du vote et le mettre dans le state
			const _wfs = await _contract.methods.getWorkFlowStatus().call()


			//subscribe to event Voted
			const client = _contract.events.WorkflowStatusChange(
				{
					fromBlock: _web3.eth.getBlock('latest').number,
				},
				function (error, event) {
					//console.log('event after voted',event)
				}
			)

			client.on('connected',  () => setWs(client))
			client.on('data', (event) => handleWfsChange(event))
			client.on('changed', function (event) {
					// remove event from local database
			})
			client.on('error', function (error, receipt) {
					// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
					console.log('on error', receipt) // same results as the optional callback above
			})

			setWeb3(_web3)
			setAccount(_accounts[0])
			setContract(_contract)
			setWfs(_wfs)
			setOwner(_owner)
			setLoading(false)

		} catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				`Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`
			)
			console.error(error)
			setLoading(false)
		}

	}
 
	const handleWfsChange = (event) => {
		
		switch (parseInt(event.returnValues.newStatus)) {
			case 0:
				setWfs('RegisteringVoters')
				break
			case 1:
				setWfs('ProposalsRegistrationStarted')
				break
			case 2:
				setWfs('ProposalsRegistrationEnded')
				break
			case 3:
				setWfs('VotingSessionStarted')
				break
			case 4:
				setWfs('VotingSessionEnded')
				break
			case 5:
				setWfs('VotesTallied')
				break
			default:
				break
		}

	}
 
	const radios = [
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

	const handleToggleChange = async (event) => {
		// Only owner of the contract can change this toggle.
		// other users can only see toggle position but cannot change it.
		if (account !== owner) return

		const targetting = event.currentTarget.value

		try {
			setLoading(true)

			await updateVotingProcess(targetting)

			setWfs(targetting)
			setLoading(false)
		} catch (error) {
			// Remettre le toggle a previous
			//document.getElementById('radioToggle').value = previous
			setLoading(false)
		}
	}

	const updateVotingProcess = async (status) => {
		// Interaction avec le smart contract pour changer statuts du process de voting

		switch (status) {
			case 'RegisteringVoters':
				await contract.methods
					.startRegisteringVoters()
					.send({ from: account })
				break
			case 'ProposalsRegistrationStarted':
				await contract.methods
					.startProposalRegistration()
					.send({ from: account })
				break
			case 'ProposalsRegistrationEnded':
				await contract.methods
					.stopProposalRegistration()
					.send({ from: account })
				break
			case 'VotingSessionStarted':
				await contract.methods
					.startVotingSession()
					.send({ from: account })
				break
			case 'VotingSessionEnded':
				await contract.methods
					.stopVotingSession()
					.send({ from: account })
				break
			case 'VotesTallied':
				// Afficher le div qui affiche le gagnant
				await contract.methods
					.votesTallied()
					.send({ from: account })
				break
			default:
				break
		}
	}

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
					{radios.map((radio, idx) => (
						<ToggleButton
							key={idx}
							type="radio"
							variant={wfs === radio.value ? 'success' : 'secondary'}
							name="radioToggle"
							value={radio.value}
							checked={wfs === radio.value}
							disabled={owner !== account}
							onChange={handleToggleChange}
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
				{owner === account && wfs === 'RegisteringVoters' ?	<AuthorizeAccount  contract={contract} account={account} />:''}
				<br></br>
				{wfs === 'ProposalsRegistrationStarted' ? <MakeProposal  contract={contract} account={account} />:''}
				<br></br>
				{wfs === 'VotingSessionStarted' ? <VoteFor contract={contract} account={account}/>:''}
				<br></br>
				{wfs === 'VotesTallied' ? <TheWinnerBox contract={contract} />:''}
			</div>
	)
	
}

export default App
