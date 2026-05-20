import express from 'express'
import verifyUserToken from '../middlewares/verifyUserToken.js'
import verifyUserRole from '../middlewares/verifyUserRole.js'
import { getAllPricing, createPricing, updatePricing, deletePricing } from '../controllers/pricing.controller.js'

const pricingRouter = express.Router()

pricingRouter.get('/', getAllPricing )

pricingRouter.use(verifyUserToken)
pricingRouter.use(verifyUserRole(['admin']))

pricingRouter.post('/', createPricing )
pricingRouter.put('/:id', updatePricing )
pricingRouter.delete('/:id', deletePricing )

export default pricingRouter