const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');

router.use(bodyParser.json());

AWS.config.update({ region: 'us-east-1' });
const lambda = new AWS.Lambda();

function handleDeposit(accountId, amount) {
  console.log(`Depositing $${amount} into account ${accountId}`);
  return true;
}

router.post('/deposit', async (req, res) => {
  const { accountId, amount } = req.body;

  if (!accountId || !amount) {
    return res.status(400).json({ message: 'Missing accountId or amount' });
  }

  const success = handleDeposit(accountId, amount);

  if (!success) {
    return res.status(500).json({ message: 'Deposit failed' });
  }

  const payload = {
    user: req.user?.username || 'anonymous',
    accountId,
    amount,
    timestamp: new Date().toISOString()
  };

  const params = {
    FunctionName: 'HighValueDepositHandler',
    InvocationType: 'Event',
    Payload: JSON.stringify(payload)
  };

  try {
    await lambda.invoke(params).promise();
    console.log('✅ Lambda invoked successfully');
  } catch (err) {
    console.error('❌ Lambda error:', err);
  }

  return res.status(200).json({ message: 'Deposit successful' });
});

module.exports = router;