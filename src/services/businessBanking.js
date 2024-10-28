const { postData, fetchData, postDataBankBox, fetchDataBankBox } = require("../helpers/external-call");
const baseData = require("../base");
// get database
const knex = require('../database/db');
const { default: axios } = require("axios");

const bankBoxRegistration = async (business) => {

    try{
    
        const userObject = await knex('users').where('email', business.email).first();
        if(typeof userObject !== "object"){
            return "User data could not be found";
        }
        
        const newMarchPayload = {
            email: business.email, 
            fname: userObject.fname, 
            lname: userObject.lname, 
            phone: business.phone, 
            business_name : business.business_name
        }

        // Create merchant if not registered
        const newMerchantResponse = await postData(`${baseData.bankBoxUrl}/business/v2/create_business`, newMarchPayload);
  
        if (!newMerchantResponse || newMerchantResponse.data.status === 'fail') {
          return false
        }
        
        return true;
  
    }catch(err){
      console.log("err >>", err)
      return false;
    }
  }

  const bankBoxAuthToken = async (business) => {

    try{

      //send a request to POS for data to be created
      const bankBoxAuthToken = await axios.get(`${baseData.bankBoxUrl}/business/v2/get_business_auth_key?businessEmail=${business.email}`);
      if (!bankBoxAuthToken || bankBoxAuthToken.data.status === 'fail') {
        return {
            status:'fail',
            message:bankBoxAuthToken.data.message,
            data:bankBoxAuthToken.data.message
          }
      }

      return {
        status:'success',
        data:bankBoxAuthToken.data.data
      }
  
  
    }catch(err){
      console.log("err >>", err)
      return "An error occurred, please try again";
    }
  }

  const buyAirtime = async (req, amount, phone_number) => {

    try{

        const Token = req.bankBoxAuthToken;

        const airtimeData = {
            amount,
            phone_number
        }

        //send a request to POS for data to be created x-auth-key
        const airtimePurchase = await postDataBankBox(`${baseData.bankBoxUrl}/business/v2/airtime_recharge`, airtimeData, Token);
 
        if (airtimePurchase) {
            return airtimePurchase.data
        }

        return {
            status:"fail",
            message:"Airtime purchase failed"
        }
  
  
    }catch(err){
      console.log("err >>", err)
      return {
        status:"fail",
        message:"An error occurred, airtime purchase failed"
    }
    }
  }

const fetchBankBoxProfile = async (req) => {

    try{

        const Token = req.bankBoxAuthToken;

      //send a request to POS for data to be created
      const bankBoxAuthToken = await fetchDataBankBox(`${baseData.bankBoxUrl}/business/v2/get_business_info`, Token);
      
      if (!bankBoxAuthToken || bankBoxAuthToken.data.status === 'fail') {
        return {
            status:'fail',
            message:bankBoxAuthToken.data.message
          }
      }

      return {
        status:'success',
        data:bankBoxAuthToken.data.data
      }
  
  
    }catch(err){
      console.log("err >>", err)
      return {
        status:'fail',
        message:"An error occurred, please try again"
      };
    }
  }

  const requestTerminal = async (req, pos_request_type, quantity, purpose, delivery_state, delivery_address, delivery_lga, landmark) => {

    try{

        const Token = req.bankBoxAuthToken;

        const payload = {
            pos_request_type,
            quantity,
            purpose,
            delivery_state,
            delivery_address,
            delivery_lga,
            landmark
        }

        //send a request to POS for data to be created x-auth-key
        const terminalRequest = await postDataBankBox(`${baseData.bankBoxUrl}/business/v2/request_terminal`, payload, Token);
 
        if (terminalRequest) {
            return terminalRequest.data
        }

        return {
            status:"fail",
            message:"Terminal request failed"
        }
  
  
    }catch(err){
      console.log("err >>", err)
      return {
            status:"fail",
            message:"An error occurred, terminal request failed"
        }
    }
  }

  const buyData = async (req, amount, phone_number, code) => {

    try {
  
      const Token = req.bankBoxAuthToken;
  
      const dataPayload = {
        amount,
        phone_number,
        code
      }
  
      //send a request to POS for data to be created x-auth-key
      const dataPurchase = await postDataBankBox(`${baseData.bankBoxUrl}/business/v2/data_recharge`, dataPayload, Token);
  
      if (dataPurchase) {
        return dataPurchase.data
      }
  
      return {
        status: "fail",
        message: "Data purchase failed"
      }
  
  
    } catch (err) {
      console.log("err >>", err)
      return {
        status: "fail",
        message: "An error occurred, data purchase failed"
      }
    }
  }
  
  
  
  const cableRechargeBankBox = async (req, amount, phone_number, code, smart_card_number, provider) => {
  
    try {
  
      const Token = req.bankBoxAuthToken;
  
      const cableData = {
        amount,
        phone_number,
        code,
        smart_card_number,
        provider
      }
  
      //send a request to POS for data to be created x-auth-key
      const cablePurchase = await postDataBankBox(`${baseData.bankBoxUrl}/business/v2/cable_recharge`, cableData, Token);
  
      if (cablePurchase) {
        return cablePurchase.data
      }
  
      return {
        status: "fail",
        message: "Cable recharge failed"
      }
  
  
    } catch (err) {
      console.log("err >>", err)
      return {
        status: "fail",
        message: "An error occurred, cable recharge failed"
      }
    }
  }
  
  
  const electricityRechargeBankBox = async (req, amount, phone_number, meter_type, meter_no, provider) => {
  
    try {
  
      const Token = req.bankBoxAuthToken;
  
      const electricityData = {
        amount,
        phone_number,
        meter_type,
        meter_no,
        provider
      }
  
      //send a request to POS for data to be created x-auth-key
      const electricityPurchase = await postDataBankBox(`${baseData.bankBoxUrl}/business/v2/electricity_recharge`, electricityData, Token);
  
      if (electricityPurchase) {
        return electricityPurchase.data
      }
  
      return {
        status: "fail",
        message: "Electricity recharge failed"
      }
  
  
    } catch (err) {
      console.log("err >>", err)
      return {
        status: "fail",
        message: "An error occurred, electricity recharge failed"
      }
    }
  }
  
  
  const betRechargeBankBox = async (req, amount, account_id, platform, customer_name) => {
  
    try {
  
      const Token = req.bankBoxAuthToken;
  
      const betData = {
        amount,
        account_id,
        platform,
        customer_name
      }
  
      //send a request to POS for data to be created x-auth-key
      const betPurchase = await postDataBankBox(`${baseData.bankBoxUrl}/business/v2/bet_recharge`, betData, Token);
  
      if (betPurchase) {
        return betPurchase.data
      }
  
      return {
        status: "fail",
        message: "Bet account recharge failed"
      }
  
  
    } catch (err) {
      console.log("err >>", err)
      return {
        status: "fail",
        message: "An error occurred, bet account recharge failed"
      }
    }
  }
  
  
  const initTransfer = async (req, amount, bank_code, narration, bank, account_number, account_name) => {
  
    try {
  
      const Token = req.bankBoxAuthToken;
  
      const trfData = {
        amount,
        bank_code,
        narration,
        bank,
        account_number,
        account_name
      }
  
      //send a request to POS for data to be created x-auth-key
      const transferResponse = await postDataBankBox(`${baseData.bankBoxUrl}/business/v2/init_transfer`, trfData, Token);
  
      if (transferResponse) {
        return transferResponse.data
      }
      
      return {
        status: "fail",
        message: "Transfer failed"
      }
  
  
    } catch (err) {
      console.log("err >>", err)
      return {
        status: "fail",
        message: "An error occurred, transfer failed"
      }
    }
  }

  const updateAppAlert = async (req, token) => {
  
    try {
  
      const Token = req.bankBoxAuthToken;
  
      const updateData = {
        token
      }
  
      //send a request to POS for data to be created x-auth-key
      const updateResponse = await postDataBankBox(`${baseData.bankBoxUrl}/business/v2/update_app_alert`, updateData, Token);
  
      if (!updateResponse || updateResponse.data.status === 'fail') {
        return {
          status: 'fail',
          message: updateResponse.data.message || 'App alert update failed'
        }
      }
      
      return {
        status: "success",
        message: updateResponse.data.message
      }
  
  
    } catch (err) {
      console.log("err >>", err)
      return {
        status: "fail",
        message: "An error occurred, app alert update failed"
      }
    }
  }

  const addAlertContact = async (req, token, tid, serial, phone, lname, fname, contact_email, whatsapp_enabled, sms_enabled, email_enabled) => {
  
    try {
  
      const Token = req.bankBoxAuthToken;
  
      const updateData = {
        token,
        tid,
        serial,
        phone,
        lname,
        fname,
        contact_email,
        whatsapp_enabled,
        sms_enabled,
        email_enabled
      }
  
      //send a request to POS for data to be created x-auth-key
      const contactResponse = await postDataBankBox(`${baseData.bankBoxUrl}/business/v2/add_contact`, updateData, Token);
  
      if (!contactResponse || contactResponse.data.status === 'fail') {
        return {
          status: 'fail',
          message: contactResponse.data.message || 'Alert contact creation failed'
        }
      }
      
      return contactResponse.data
  
  
    } catch (err) {
      console.log("err >>", err)
      return {
        status: "fail",
        message: "An error occurred, alert contact creation failed"
      }
    }
  }

  const updateAlertContact = async (req, token, tid, phone, status, id) => {
  
    try {
  
      const Token = req.bankBoxAuthToken;
  
      const updateData = {
        token,
        tid,
        phone,
        status,
        id
      }
  
      //send a request to POS for data to be created x-auth-key
      const updateResponse = await postDataBankBox(`${baseData.bankBoxUrl}/business/v2/update_detail`, updateData, Token);
  
      if (!updateResponse || updateResponse.data.status === 'fail') {
        return {
          status: 'fail',
          message: updateResponse.data.message || 'Alert contact update failed'
        }
      }
      
      return {
        status: "success",
        message: updateResponse.data.message,
        data: updateResponse.data.data
      }
  
  
    } catch (err) {
      console.log("err >>", err)
      return {
        status: "fail",
        message: "An error occurred, alert contact update failed"
      }
    }
  }

  const getAlertDetails = async (req, tid, token) => {
  
    try {
  
      const Token = req.bankBoxAuthToken;
  
      const updateData = {
        tid,
        token
      }
  
      //send a request to POS for data to be created x-auth-key
      const alertDetail = await postDataBankBox(`${baseData.bankBoxUrl}/business/v2/get_details`, updateData, Token);
  
      if (alertDetail) {
        return alertDetail;
      }
      
      return {
        status: "fail",
        message: "Error fetching alert details"
      }
  
  
    } catch (err) {
      console.log("err >>", err)
      return {
        status: "fail",
        message: "An error occurred, get alert details failed"
      }
    }
  }

  const removeContact = async (req, token, id) => {
  
    try {
  
      const Token = req.bankBoxAuthToken;
  
      const removeData = {
        token,
        id
      }
  
      //send a request to POS for data to be created x-auth-key
      const response = await postDataBankBox(`${baseData.bankBoxUrl}/business/v2/remove_contact`, removeData, Token);
  
      if (!response || response.data.status === 'fail') {
        return {
          status: "fail",
          message: response.data.message || "Remove contact failed"
        }
      }
      
      return {
        status: "success",
        message: response.data.message,
        data: response.data.data
      }
  
  
    } catch (err) {
      console.log("err >>", err)
      return {
        status: "fail",
        message: "An error occurred, get alert details failed"
      }
    }
  }

  module.exports = {
    bankBoxRegistration,
    bankBoxAuthToken,
    buyAirtime,
    fetchBankBoxProfile,
    requestTerminal,
    buyData,
    initTransfer,
    cableRechargeBankBox,
    electricityRechargeBankBox,
    betRechargeBankBox,
    updateAppAlert,
    addAlertContact,
    updateAlertContact,
    getAlertDetails,
    removeContact
  };