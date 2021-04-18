import  React, {Component} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import {Card, ListGroup, Table } from 'react-bootstrap'

class ListProposals extends Component {

	state = { proposals: [], loading: true }
	

	componentDidMount = async () => {
		try {



		// récupérer la liste des comptes autorisés
		const proposals = await this.props.contract.methods.getProposals().call()
		// Mettre à jour le state
		this.setState({ proposals, loading:false })

		//subscribe to event ProposalRegistered
		this.props.contract.events.ProposalRegistered(
			{
				fromBlock: this.props.web3.eth.getBlock('latest').number,
			},
			function (error, event) {
				//console.log('event after registered a proposal',event)
			}
		)
		.on('connected', function (subscriptionId) {})
		.on('data', (event) => this.addPropal(event))
		.on('changed', function (event) {
				// remove event from local database
		})
		.on('error', function (error, receipt) {
				// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
				console.log('on error', receipt) // same results as the optional callback above
		})



		//subscribe to event Voted
		this.props.contract.events.Voted(
			{
					fromBlock: this.props.web3.eth.getBlock('latest').number,
				},
				function (error, event) {
					//console.log('event after voted',event)
				}
		)
		.on('connected', function (subscriptionId) {})
		.on('data', (event) => this.addVote(event))
		.on('changed', function (event) {
				// remove event from local database
		})
		.on('error', function (error, receipt) {
				// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
				console.log('on error', receipt) // same results as the optional callback above
		})

			 
		} catch (error) {
			this.setState({ loading:false })

			// Catch any errors for any of the above operations.
			alert(
				`Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`
			)
			console.error(error)


		}
	}	


	addVote = (event) => {

		const { proposals } = this.state

		
		let localArray = [...proposals]

		localArray[parseInt(event.returnValues.proposalId)].voteCount++
		
		this.setState({ proposals: localArray})

		console.log('addVote:event.returnValues.proposalId',event.returnValues.proposalId)
	}

	addPropal = (event) => {
		const { proposals } = this.state

		const localArray = [...proposals, event.returnValues.propal]

		this.setState({ proposals: localArray })
		console.log('addPropal:event.returnValues.propal',event.returnValues.propal)

	}


	render () {

		const { proposals, loading } = this.state


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

}

export default ListProposals

