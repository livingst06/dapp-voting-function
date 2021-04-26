import 'bootstrap/dist/css/bootstrap.min.css'
import React, { useState, useEffect, useRef } from 'react'
import { Card, Form, Button } from 'react-bootstrap'

function useIsMountedRef() {
	const isMountedRef = useRef(null)
	useEffect(() => {
		isMountedRef.current = true
		return () => (isMountedRef.current = false)
	})
	return isMountedRef
}

function VoteFor(props) {

	const [proposals, setProposals] = useState([])
	const [index, setIndex] = useState(-1)

	const isMountedRef = useIsMountedRef()

	useEffect(() => {
		init()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const init = async () => {
		try {
			// récupérer la liste des propositions
			const _proposals = await props.contract.methods.getProposals().call()
			// Mettre à jour le state
			isMountedRef.current && setProposals(_proposals)
		} catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				`Non-Ethereum browser detected. Can you please try to install MetaMask before starting.`
			)
			console.error(error)
		}
	}

	const handleChange = (e) => {
		isMountedRef.current && setIndex(e.target.value)
	}

	const handleClick = async (event) => {
		event.preventDefault()

		if (index === -1) return

		try {
			// Interaction avec le smart contract pour ajouter un compte
			await props.contract.methods.vote(index).send({ from: props.account })
		} catch (e) {
			console.error(e)
		}
	}

	return (
		<div style={{ disabled: 'true', display: 'flex', justifyContent: 'center' }}>
			<Card style={{ width: '50rem' }}>
				<Card.Header>
					<strong>Faire un Vote</strong>
				</Card.Header>
				<Card.Body>
					<Form.Control as="select" value={index} onChange={handleChange}>
						<option disabled value={-1} key={-1}>
							select
						</option>
						{proposals.map((p, i) => (
							<option value={i} key={i}>
								{i} {p.description}
							</option>
						))}
					</Form.Control>
					<Button onClick={handleClick} variant="primary">
						{' '}
						Voter{' '}
					</Button>
				</Card.Body>
			</Card>
		</div>
	)
}

export default VoteFor
