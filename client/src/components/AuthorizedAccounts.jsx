import  React, {Component} from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import {Card, ListGroup, Table } from 'react-bootstrap'

class AuthorizedAccounts extends Component {

	state = { adresses: [], loading: true }
	

	componentDidMount = async () => {
		try {


			//subscribe to event Voted
			this.props.contract.events.VoterRegistered(
				{
					fromBlock: this.props.web3.eth.getBlock('latest').number,
				},
				function (error, event) {
					//console.log('event after voted',event)
				}
		)
		.on('connected', function (subscriptionId) {})
		.on('data', (event) => this.addAuthorizedAccount(event))
		.on('changed', function (event) {
				// remove event from local database
		})
		.on('error', function (error, receipt) {
				// If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
				console.log('on error', receipt) // same results as the optional callback above
		})


		// récupérer la liste des comptes autorisés
		const adresses = await this.props.contract.methods.getAdresses().call()
		// Mettre à jour le state
		this.setState({ adresses, loading:false })

			 
		} catch (error) {
			this.setState({ loading:false })

			// Catch any errors for any of the above operations.
			alert(
				`Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`
			)
			console.error(error)


		}
	}	


	addAuthorizedAccount = (event) => {
		const { adresses } = this.state

		const localArray = [...adresses, event.returnValues.voterAddress]

		this.setState({ adresses: localArray })
	}


	render () {

		const { adresses, loading } = this.state


		if (loading) return <div>loading authorized accounts...</div>
		

		return (
	
			<div style={{ display: 'flex', justifyContent: 'center' }}>
		
					<Card style={{ width: '50rem' }}>
						<Card.Header>
							<strong>Liste des comptes autorisés</strong>
						</Card.Header>
						<Card.Body>
							<ListGroup variant="flush">
								<ListGroup.Item>
									<Table striped bordered hover>
										<tbody>
											{
												adresses.map((address, i) => (
													<tr key={i}>
														<td>{address}</td>
													</tr>
												))
											}
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

export default AuthorizedAccounts

