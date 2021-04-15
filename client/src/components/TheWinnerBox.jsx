import 'bootstrap/dist/css/bootstrap.min.css'
import  React, {Component} from 'react'

import { Card, Table } from 'react-bootstrap'

class TheWinnerBox extends Component {

	state = { theWinner: '', loading: true }
	

	componentDidMount = async () => {
		try {


			setTimeout(async () => {
			
				// récupérer la liste des comptes autorisés
				const theWinner = await this.props.contract.methods.winnerName().call()
				// Mettre à jour le state
				this.setState({ theWinner, loading:false })
			
			},3000)


			 
		} catch (error) {
			this.setState({ loading:false })

			// Catch any errors for any of the above operations.
			alert(
				`Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`
			)
			console.error(error)


		}
	}	

	render() {

		const { theWinner, loading } = this.state

		return (
	 
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<Card style={{ width: '50rem' }}>
					<Card.Header>
						<strong>Et le gagnant est : </strong>
					</Card.Header>
					<Card.Body>
								<Table striped bordered hover>
									<tbody>
										<tr>
											{loading?<td>............loading.......</td>:<td>{theWinner}</td>}
										</tr>
									</tbody>
								</Table>
					</Card.Body>
				</Card>
			</div>
			 
		)

	}
 
}

export default TheWinnerBox
