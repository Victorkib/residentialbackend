import Clearance from '../../../models/v2/models/clearance.model.js';
import Tenant from '../../../models/v2/models/v2Tenant.model.js';
import { clearDeficitsForPreviousPayments } from '../../../utils/v2/utils/paymentHelper.js';

export const getTenantClearData = async (req, res) => {
  const { tenantId } = req.params;
  try {
    // Correct usage of sort
    const clearanceData = await Clearance.find({ tenant: tenantId }).sort({
      createdAt: -1,
    });

    // Check if the array is empty
    if (clearanceData.length < 0) {
      return res
        .status(404)
        .json({ message: 'No clearance tenant data found!' });
    }

    // Send the retrieved data
    res.status(200).json(clearanceData);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Error fetching clearance data' });
  }
};

//delete clearance data
export const deleteClearanceData = async (req, res) => {
  const { id } = req.params;
  try {
    const clearanceDt = await Clearance.findByIdAndDelete(id);
    if (!clearanceDt) {
      return res
        .status(404)
        .json({ message: 'No Such Clearance Dt found to Delete' });
    }
    res.status(200).json(clearanceDt);
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Error deleting Clearance data!' });
  }
};

// updateClearanceData
export const updateClearanceData = async (req, res) => {
  const { clearDataId } = req.params;
  const { amount, tenantId, date, receivedMonth, year } = req.body;
  try {
    if (isNaN(amount) || Number(amount) < 0) {
      return res.status(400).json({ message: 'Invalid amount!' });
    }

    // Array of month names
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    // Convert month number to month name
    const month = monthNames[Number(receivedMonth) - 1];
    console.log('month: ', month);

    // Find the clearance data
    const clearance = await Clearance.findById(clearDataId);
    if (!clearance) {
      return res.status(400).json({ message: 'No clearance data found!' });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: 'No Tenant found!' });
    }

    // Clear any deficits left from previous payments
    let remainingAmount = await clearDeficitsForPreviousPayments(
      tenantId,
      parseFloat(amount) || 0, // Ensure amount is treated as a float
      date,
      tenant.deposits.referenceNo,
      month,
      year
    );

    console.log('remainingAmount: ', remainingAmount);

    // Calculate original global deficit before updates
    const originalGlobalDeficit =
      parseFloat(clearance.paintingFee.deficit) +
      parseFloat(clearance.miscellaneous.deficit);

    // Step 1: Handle Painting Fee Deficit
    const paintingDeficit =
      parseFloat(clearance.paintingFee.expected) -
      (parseFloat(clearance.paintingFee.amount) || 0); // Ensure amount is treated as a float

    if (paintingDeficit > 0) {
      // Scenario 1: Full Payment for Painting
      if (parseFloat(remainingAmount) >= parseFloat(paintingDeficit)) {
        clearance.paintingFee.amount += parseFloat(paintingDeficit);
        remainingAmount -= paintingDeficit;
        clearance.paintingFee.deficit = 0;

        // Add transaction history for full payment
        clearance.paintingFee.transactions.push({
          amount: parseFloat(paintingDeficit) || 0,
          expected: clearance.paintingFee.expected,
          date,
          referenceNumber: tenant.deposits.referenceNo,
          description: `Full payment clearing painting fee`,
        });

        clearance.paintingFee.deficitHistory.push({
          amount: parseFloat(clearance.paintingFee.deficit) || 0,
          date,
          description: `Painting fee deficit fully cleared`,
        });

        // Mark as paid
        clearance.paintingFee.paid = true;
      }
      // Scenario 2: Partial Payment for Painting
      else if (
        parseFloat(remainingAmount) > 0 &&
        parseFloat(remainingAmount) < parseFloat(paintingDeficit)
      ) {
        let paintingDeduction = remainingAmount;

        // Deduct from painting amount and update deficit
        clearance.paintingFee.amount += parseFloat(paintingDeduction);
        remainingAmount -= paintingDeduction;
        clearance.paintingFee.deficit =
          parseFloat(paintingDeficit) - parseFloat(paintingDeduction);

        // Add partial payment transaction and deficit history
        clearance.paintingFee.transactions.push({
          amount: paintingDeduction,
          expected: clearance.paintingFee.expected,
          date,
          referenceNumber: tenant.deposits.referenceNo,
          description: `Partial payment towards painting fee`,
        });

        clearance.paintingFee.deficitHistory.push({
          amount: parseFloat(clearance.paintingFee.deficit) || 0,
          date,
          description: `Partial payment made for painting fee, deficit updated`,
        });
      }
    }

    // Step 2: Handle Miscellaneous Fee Deficit
    clearance?.miscellaneous?.forEach((miscItem) => {
      // Calculate the deficit for each miscellaneous fee item
      const miscDeficit =
        parseFloat(miscItem.expected) - parseFloat(miscItem.amount);

      if (miscDeficit > 0) {
        // Scenario 1: Full Payment for Miscellaneous
        if (remainingAmount >= miscDeficit) {
          // Update the amount and remaining amount
          miscItem.amount += parseFloat(miscDeficit);
          remainingAmount -= miscDeficit;
          miscItem.deficit = 0;

          // Add transaction history for full payment
          miscItem.transactions.push({
            amount: parseFloat(miscDeficit),
            expected: parseFloat(miscItem.expected),
            date,
            referenceNumber: tenant.deposits.referenceNo,
            description: `Full payment clearing miscellaneous fee`,
          });

          miscItem.deficitHistory.push({
            amount: parseFloat(miscItem.deficit),
            date,
            description: `Miscellaneous fee deficit fully cleared`,
          });

          // Mark as paid
          miscItem.paid = true;
        }
        // Scenario 2: Partial Payment for Miscellaneous
        else if (remainingAmount > 0 && remainingAmount < miscDeficit) {
          let miscDeduction = parseFloat(remainingAmount);

          // Deduct from miscellaneous amount and update deficit
          miscItem.amount += parseFloat(miscDeduction);
          remainingAmount -= parseFloat(miscDeduction);
          miscItem.deficit =
            parseFloat(miscDeficit) - parseFloat(miscDeduction);

          // Add partial payment transaction and deficit history
          miscItem.transactions.push({
            amount: parseFloat(miscDeduction),
            expected: parseFloat(miscItem.expected),
            date,
            referenceNumber: tenant.deposits.referenceNo,
            description: `Partial payment towards miscellaneous fee`,
          });

          miscItem.deficitHistory.push({
            amount: parseFloat(miscItem.deficit),
            date,
            description: `Partial payment made for miscellaneous fee, deficit updated`,
          });
        }
      }
    });

    // Step 3: Calculate new global deficit based on updated painting and miscellaneous deficits
    const updatedMiscDeficit = clearance.miscellaneous.reduce(
      (total, miscItem) => total + (parseFloat(miscItem.deficit) || 0),
      0
    );

    const updatedGlobalDeficit =
      parseFloat(clearance.paintingFee.deficit) +
      parseFloat(updatedMiscDeficit);

    // Calculate the change in global deficit
    const globalDeficitChange =
      parseFloat(originalGlobalDeficit) - parseFloat(updatedGlobalDeficit);

    // Update the global deficit with the new value
    clearance.globalDeficit = parseFloat(updatedGlobalDeficit);

    if (!isNaN(globalDeficitChange)) {
      clearance.globalTransactions.push({
        amount: parseFloat(globalDeficitChange).toFixed(2),
        expected: parseFloat(clearance.globalDeficit),
        date,
        referenceNumber: tenant.deposits.referenceNo,
        description: `Update to global deficit after clearing painting and miscellaneous deficits`,
      });
    }

    clearance.globalDeficitHistory.push({
      amount: parseFloat(globalDeficitChange) || 0,
      date,
      description: `Global deficit adjusted by ${globalDeficitChange} after payments`,
    });

    // Step 4: Handle remaining amount as overpay (if any)
    clearance.totalAmountPaid =
      parseFloat(clearance.totalAmountPaid) + parseFloat(amount); // Ensure amount is treated as a float
    if (remainingAmount > 0) {
      clearance.overpay += parseFloat(remainingAmount);

      clearance.excessHistory.push({
        initialOverpay:
          parseFloat(clearance.overpay) - parseFloat(remainingAmount),
        excessAmount: parseFloat(remainingAmount),
        description: `Excess payment of ${remainingAmount} added`,
        date,
      });
    }

    // Update isCleared status
    clearance.isCleared =
      clearance.paintingFee.paid &&
      clearance.miscellaneous.every((miscItem) => miscItem.paid);

    // Save updated clearance data
    await clearance.save();

    res.status(200).json({
      message: 'Clearance data updated successfully',
      clearance,
      remainingAmount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || 'Error updating clearance data!' });
  }
};
