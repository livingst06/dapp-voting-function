import  React, {useState, useEffect} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import {Card, ListGroup, Table } from 'react-bootstrap'

function ListProposals(props) {

	const [proposals, setProposals] = useState([])
	const [loading, setLoading] = useState(true)

	
	let subPropalRegisId = null
	let subVotedId = null


	useEffect(() => {
		runInit()
		return () => {
			cleanup()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])


	const cleanup = () => {

		subPropalRegisId.unsubscribe()
		subVotedId.unsubscribe()
		
	}

	const runInit = async () => {
		try {



			//subscribe to event ProposalRegistered
			subPropalRegisId = props.contract.events.ProposalRegistered(
				{
					fromBlock: props.web3.eth.getBlock('latest').number,
				},
				function (error, event) {
					//console.log('event after registered a proposal',event)
				}
			)
			.on('connected', function (subscriptionId) {})
			.on('data', (event) => updatePropal(event))
			.on('changed', function (event) {
					// remove event from local database
			})
			.on('error', function (error, receipt) {
					// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
					console.log('on error', receipt) // same results as the optional callback above
			})

			//subscribe to event Voted
			subVotedId = props.contract.events.Voted(
				{
						fromBlock: props.web3.eth.getBlock('latest').number,
					},
					function (error, event) {
						//console.log('event after voted',event)
					}
			)
			.on('connected', function (subscriptionId) {})
			.on('data', (event) => updatePropal(event))
			.on('changed', function (event) {
					// remove event from local database
			})
			.on('error', function (error, receipt) {
					// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
					console.log('on error', receipt) // same results as the optional callback above
			})


			// récupérer la liste des comptes autorisés
			const _proposals = await props.contract.methods.getProposals().call()
			// Mettre à jour le state
			setProposals(_proposals)
			setLoading(false)
			 
		} catch (error) {
			setLoading(false)

			// Catch any errors for any of the above operations.
			alert(
				`Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`
			)
			console.error(error)


		}
	}	

	const updatePropal = async (event) => {


		const _proposals = await props.contract.methods.getProposals().call()
		setProposals(_proposals)



	}

	if (loading) return <div>loading proposals...</div>
		

	return (
	
			<div style={{ display: 'flex', justifyContent: 'center' }}>
		
					<Card style={{ width: '50rem' }}>
						<Card.Header>
							<strong>Liste des propositions</strong>
						</Card.Header>
						<Card.Body>
							<ListGroup variant="flush">
								<ListGroup.Item>
									<Table striped bordered hover>
									<thead>
										<tr>
											<th>candidates</th>
											<th>vote Count</th>
										</tr>
									</thead>
									<tbody>
										{proposals.map((p, i) => (
												<tr key={i}>
													<td>{p.description}</td>
													<td>{p.voteCount}</td>
												</tr>
											))}
									</tbody>
									</Table>
								</ListGroup.Item>
							</ListGroup>
						</Card.Body>
					</Card>
			</div>
		


	)
	

}

export default ListProposals

