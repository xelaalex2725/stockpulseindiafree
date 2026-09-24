import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  BarChart3, Bell, BookOpen, ExternalLink, Gauge, Globe2, Layers3, LineChart,
  Menu, Newspaper, RefreshCw, Search, ShieldCheck, Sparkles, Star, TrendingDown, TrendingUp, X,
  AlertCircle, CheckCircle, Zap, Activity, Send, Bot, Download
} from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, Brush, XAxis, YAxis, Tooltip, Line } from 'recharts'
import { calculateEMA, calculateSMA, calculateRSI, calculateMACD, calculateADX, calculateATR, calculateVWAP, detectChartPattern, calculateMarketStructure, calculateSuportResistance, calculateVolumAnalysis, calculateRiskLevels, scoreSetup } from './technicalAnalysis'
import './styles.css'
import './financials.css'
import './stock-popup-baseline.css'

const LARGE_CAP_STOCKS = [
  { s: 'RELIANCE', n: 'Reliance Industries', symbol: 'RELIANCE.NS', sector: 'Energy' },
  { s: 'HDFCBANK', n: 'HDFC Bank', symbol: 'HDFCBANK.NS', sector: 'Banking' },
  { s: 'ICICIBANK', n: 'ICICI Bank', symbol: 'ICICIBANK.NS', sector: 'Banking' },
  { s: 'INFY', n: 'Infosys', symbol: 'INFY.NS', sector: 'IT' },
  { s: 'TCS', n: 'Tata Consultancy', symbol: 'TCS.NS', sector: 'IT' },
  { s: 'BHARTIARTL', n: 'Bharti Airtel', symbol: 'BHARTIARTL.NS', sector: 'Telecom' },
  { s: 'LT', n: 'Larsen & Toubro', symbol: 'LT.NS', sector: 'Infra' },
  { s: 'SBIN', n: 'State Bank of India', symbol: 'SBIN.NS', sector: 'Banking' },
  { s: 'ITC', n: 'ITC', symbol: 'ITC.NS', sector: 'FMCG' },
  { s: 'MARUTI', n: 'Maruti Suzuki', symbol: 'MARUTI.NS', sector: 'Auto' },
  { s: 'AXISBANK', n: 'Axis Bank', symbol: 'AXISBANK.NS', sector: 'Banking' },
  { s: 'WIPRO', n: 'Wipro', symbol: 'WIPRO.NS', sector: 'IT' },
  { s: 'HINDUNILVR', n: 'Hindustan Unilever', symbol: 'HINDUNILVR.NS', sector: 'FMCG' },
  { s: 'KOTAKBANK', n: 'Kotak Bank', symbol: 'KOTAKBANK.NS', sector: 'Banking' },
  { s: 'SUNPHARMA', n: 'Sun Pharma', symbol: 'SUNPHARMA.NS', sector: 'Pharma' },
  { s: 'ULTRACEMCO', n: 'UltraTech Cement', symbol: 'ULTRACEMCO.NS', sector: 'Cement' },
  { s: 'TITAN', n: 'Titan Company', symbol: 'TITAN.NS', sector: 'Consumer' },
  { s: 'NTPC', n: 'NTPC', symbol: 'NTPC.NS', sector: 'Power' },
  { s: 'ONGC', n: 'ONGC', symbol: 'ONGC.NS', sector: 'Energy' },
  { s: 'POWERGRID', n: 'Power Grid', symbol: 'POWERGRID.NS', sector: 'Power' },
  { s: 'COALINDIA', n: 'Coal India', symbol: 'COALINDIA.NS', sector: 'Mining' },
  { s: 'IOC', n: 'Indian Oil', symbol: 'IOC.NS', sector: 'Energy' },
  { s: 'TATAMOTORS', n: 'Tata Motors', symbol: 'TATAMOTORS.NS', sector: 'Auto' },
  { s: 'HEROMOTOCO', n: 'Hero MotoCorp', symbol: 'HEROMOTOCO.NS', sector: 'Auto' },
  { s: 'BAJFINANCE', n: 'Bajaj Finance', symbol: 'BAJFINANCE.NS', sector: 'Finance' },
  { s: 'BAJAJ-AUTO', n: 'Bajaj Auto', symbol: 'BAJAJ-AUTO.NS', sector: 'Auto' },
  { s: 'BAJJ', n: 'Bajaj Finserv', symbol: 'BAJAJFINSV.NS', sector: 'Finance' },
  { s: 'HCLTECH', n: 'HCL Technologies', symbol: 'HCLTECH.NS', sector: 'IT' },
  { s: 'TECHM', n: 'Tech Mahindra', symbol: 'TECHM.NS', sector: 'IT' },
  { s: 'ASIANPAINT', n: 'Asian Paints', symbol: 'ASIANPAINT.NS', sector: 'Paints' },
  { s: 'NESTLEIND', n: 'Nestle India', symbol: 'NESTLEIND.NS', sector: 'FMCG' },
  { s: 'DRREDDY', n: 'Dr Reddy’s', symbol: 'DRREDDY.NS', sector: 'Pharma' },
  { s: 'CIPLA', n: 'Cipla', symbol: 'CIPLA.NS', sector: 'Pharma' },
  { s: 'SUNTV', n: 'Sun TV Network', symbol: 'SUNTV.NS', sector: 'Media' },
  { s: 'M&M', n: 'Mahindra & Mahindra', symbol: 'M&M.NS', sector: 'Auto' },
  { s: 'JSWSTEEL', n: 'JSW Steel', symbol: 'JSWSTEEL.NS', sector: 'Steel' },
  { s: 'TATASTEEL', n: 'Tata Steel', symbol: 'TATASTEEL.NS', sector: 'Steel' },
  { s: 'UPL', n: 'UPL', symbol: 'UPL.NS', sector: 'Agri' },
  { s: 'GRASIM', n: 'Grasim Industries', symbol: 'GRASIM.NS', sector: 'Cement' },
  { s: 'EICHERMOT', n: 'Eicher Motors', symbol: 'EICHERMOT.NS', sector: 'Auto' },
  { s: 'TATACONSUM', n: 'Tata Consumer', symbol: 'TATACONSUM.NS', sector: 'FMCG' },
  { s: 'SHREECEM', n: 'Shree Cement', symbol: 'SHREECEM.NS', sector: 'Cement' },
  { s: 'INDUSINDBK', n: 'IndusInd Bank', symbol: 'INDUSINDBK.NS', sector: 'Banking' },
  { s: 'DMART', n: 'Avenue Supermarts', symbol: 'DMART.NS', sector: 'Retail' },
  { s: 'DIVISLAB', n: 'Divis Labs', symbol: 'DIVISLAB.NS', sector: 'Pharma' },
  { s: 'SBILIFE', n: 'SBI Life', symbol: 'SBILIFE.NS', sector: 'Insurance' },
  { s: 'ICICIGI', n: 'ICICI Lombard', symbol: 'ICICIGI.NS', sector: 'Insurance' },
  { s: 'HDFCLIFE', n: 'HDFC Life', symbol: 'HDFCLIFE.NS', sector: 'Insurance' },
  { s: 'APOLLOHOSP', n: 'Apollo Hospitals', symbol: 'APOLLOHOSP.NS', sector: 'Healthcare' },
  { s: 'TCS', n: 'TCS', symbol: 'TCS.NS', sector: 'IT' },
  { s: 'LTIM', n: 'LTIMindtree', symbol: 'LTIM.NS', sector: 'IT' },
  { s: 'INFY', n: 'Infosys', symbol: 'INFY.NS', sector: 'IT' },
  { s: 'GAIL', n: 'GAIL India', symbol: 'GAIL.NS', sector: 'Gas' },
  { s: 'BPCL', n: 'BPCL', symbol: 'BPCL.NS', sector: 'Energy' },
  { s: 'BEL', n: 'Bharat Electronics', symbol: 'BEL.NS', sector: 'Defence' },
  { s: 'CUMMINSIND', n: 'Cummins India', symbol: 'CUMMINSIND.NS', sector: 'Industrial' },
  { s: 'ABB', n: 'ABB India', symbol: 'ABB.NS', sector: 'Industrial' },
  { s: 'BHEL', n: 'Bharat Heavy Electricals', symbol: 'BHEL.NS', sector: 'Industrial' },
  { s: 'NMDC', n: 'NMDC', symbol: 'NMDC.NS', sector: 'Mining' },
  { s: 'HINDALCO', n: 'Hindalco', symbol: 'HINDALCO.NS', sector: 'Metals' },
  { s: 'VEDL', n: 'Vedanta', symbol: 'VEDL.NS', sector: 'Metals' },
  { s: 'NATIONALUM', n: 'National Aluminium', symbol: 'NATIONALUM.NS', sector: 'Metals' },
  { s: 'MAZDOCK', n: 'Mazagon Dock', symbol: 'MAZDOCK.NS', sector: 'Defence' },
  { s: 'SHRIRAMFIN', n: 'Shriram Finance', symbol: 'SHRIRAMFIN.NS', sector: 'Finance' },
  { s: 'BANKBARODA', n: 'Bank of Baroda', symbol: 'BANKBARODA.NS', sector: 'Banking' },
  { s: 'PNB', n: 'Punjab National Bank', symbol: 'PNB.NS', sector: 'Banking' },
  { s: 'CANBK', n: 'Canara Bank', symbol: 'CANBK.NS', sector: 'Banking' },
  { s: 'INDHOTEL', n: 'Indian Hotels', symbol: 'INDHOTEL.NS', sector: 'Hotels' },
  { s: 'TATAPOWER', n: 'Tata Power', symbol: 'TATAPOWER.NS', sector: 'Power' },
  { s: 'SYNGENE', n: 'Syngene', symbol: 'SYNGENE.NS', sector: 'Pharma' },
  { s: 'GLENMARK', n: 'Glenmark', symbol: 'GLENMARK.NS', sector: 'Pharma' },
  { s: 'PIDILITIND', n: 'Pidilite', symbol: 'PIDILITIND.NS', sector: 'Chemicals' },
  { s: 'ZOMATO', n: 'Zomato', symbol: 'ZOMATO.NS', sector: 'Internet' },
  { s: 'PAYTM', n: 'Paytm', symbol: 'PAYTM.NS', sector: 'Internet' },
  { s: 'TATACOMM', n: 'Tata Communications', symbol: 'TATACOMM.NS', sector: 'Telecom' },
  { s: 'BANDHANBNK', n: 'Bandhan Bank', symbol: 'BANDHANBNK.NS', sector: 'Banking' },
  { s: 'AUROPHARMA', n: 'Aurobindo Pharma', symbol: 'AUROPHARMA.NS', sector: 'Pharma' },
  { s: 'LAURUSLABS', n: 'Laurus Labs', symbol: 'LAURUSLABS.NS', sector: 'Pharma' },
  { s: 'GODREJPROP', n: 'Godrej Properties', symbol: 'GODREJPROP.NS', sector: 'Realty' },
  { s: 'DLF', n: 'DLF', symbol: 'DLF.NS', sector: 'Realty' },
  { s: 'LALPATHLAB', n: 'Dr Lal PathLabs', symbol: 'LALPATHLAB.NS', sector: 'Healthcare' },
  { s: 'JUBLFOOD', n: 'Jubilant FoodWorks', symbol: 'JUBLFOOD.NS', sector: 'Consumer' },
  { s: 'TVSMOTOR', n: 'TVS Motor', symbol: 'TVSMOTOR.NS', sector: 'Auto' },
  { s: 'VOLTAS', n: 'Voltas', symbol: 'VOLTAS.NS', sector: 'Consumer' },
  { s: 'WHIRLPOOL', n: 'Whirlpool', symbol: 'WHIRLPOOL.NS', sector: 'Consumer' },
  { s: 'MUTHOOTFIN', n: 'Muthoot Finance', symbol: 'MUTHOOTFIN.NS', sector: 'Finance' },
  { s: 'SUNDARMFIN', n: 'Sundaram Finance', symbol: 'SUNDARMFIN.NS', sector: 'Finance' },
  { s: 'IRCTC', n: 'IRCTC', symbol: 'IRCTC.NS', sector: 'Travel' },
  { s: 'RECLTD', n: 'REC', symbol: 'RECLTD.NS', sector: 'Finance' },
  { s: 'PFC', n: 'Power Finance Corp', symbol: 'PFC.NS', sector: 'Finance' },
  { s: 'OFSS', n: 'OFSS', symbol: 'OFSS.NS', sector: 'IT' },
  { s: 'NIFTYBEES', n: 'Nifty ETF', symbol: 'NIFTYBEES.NS', sector: 'ETF' },
  { s: 'INDIGO', n: 'InterGlobe Aviation', symbol: 'INDIGO.NS', sector: 'Aviation' },
  { s: 'DABUR', n: 'Dabur', symbol: 'DABUR.NS', sector: 'FMCG' },
  { s: 'BRITANNIA', n: 'Britannia', symbol: 'BRITANNIA.NS', sector: 'FMCG' },
  { s: 'BOSCHLTD', n: 'Bosch', symbol: 'BOSCHLTD.NS', sector: 'Auto' },
  { s: 'SIEMENS', n: 'Siemens', symbol: 'SIEMENS.NS', sector: 'Industrial' },
  { s: 'COLPAL', n: 'Colgate Palmolive', symbol: 'COLPAL.NS', sector: 'FMCG' },
  { s: 'CROMPTON', n: 'Crompton Greaves', symbol: 'CROMPTON.NS', sector: 'Consumer' },
  { s: 'BATAINDIA', n: 'Bata India', symbol: 'BATAINDIA.NS', sector: 'Consumer' },
  { s: 'ASHOKLEY', n: 'Ashok Leyland', symbol: 'ASHOKLEY.NS', sector: 'Auto' },
  { s: 'JINDALSTEL', n: 'Jindal Steel', symbol: 'JINDALSTEL.NS', sector: 'Steel' },
  { s: 'RBLBANK', n: 'RBL Bank', symbol: 'RBLBANK.NS', sector: 'Banking' },
  { s: 'IDFCFIRSTB', n: 'IDFC First Bank', symbol: 'IDFCFIRSTB.NS', sector: 'Banking' },
  { s: 'AUBANK', n: 'AU Small Finance Bank', symbol: 'AUBANK.NS', sector: 'Banking' },
  { s: 'MPHASIS', n: 'Mphasis', symbol: 'MPHASIS.NS', sector: 'IT' },
  { s: 'CLEAN', n: 'Clean Science', symbol: 'CLEAN.NS', sector: 'Chemicals' },
  { s: 'NLCINDIA', n: 'NLC India', symbol: 'NLCINDIA.NS', sector: 'Power' },
  { s: 'HFCL', n: 'HFCL', symbol: 'HFCL.NS', sector: 'Telecom' },
  { s: 'CESC', n: 'CESC', symbol: 'CESC.NS', sector: 'Power' },
  { s: 'GODREJCP', n: 'Godrej Consumer', symbol: 'GODREJCP.NS', sector: 'FMCG' },
  { s: 'MINDTREE', n: 'Mindtree', symbol: 'MINDTREE.NS', sector: 'IT' },
  { s: 'CUB', n: 'City Union Bank', symbol: 'CUB.NS', sector: 'Banking' },
  { s: 'UNOMINDA', n: 'Uno Minda', symbol: 'UNOMINDA.NS', sector: 'Auto' },
  { s: 'CHOLAFIN', n: 'Cholamandalam', symbol: 'CHOLAFIN.NS', sector: 'Finance' },
  { s: 'PFIZER', n: 'Pfizer India', symbol: 'PFIZER.NS', sector: 'Pharma' },
  { s: 'NODAL', n: 'NOCIL', symbol: 'NOCIL.NS', sector: 'Chemicals' }
]

const MID_CAP_STOCKS = [
  { s: 'POLYCAB', n: 'Polycab India', symbol: 'POLYCAB.NS', sector: 'Electrical' },
  { s: 'DIXON', n: 'Dixon Technologies', symbol: 'DIXON.NS', sector: 'Electronics' },
  { s: 'TRENT', n: 'Trent', symbol: 'TRENT.NS', sector: 'Retail' },
  { s: 'HAL', n: 'Hindustan Aeronautics', symbol: 'HAL.NS', sector: 'Defence' },
  { s: 'MUTHOOTFIN', n: 'Muthoot Finance', symbol: 'MUTHOOTFIN.NS', sector: 'Finance' },
  { s: 'PERSISTENT', n: 'Persistent Systems', symbol: 'PERSISTENT.NS', sector: 'IT' },
  { s: 'INDHOTEL', n: 'Indian Hotels', symbol: 'INDHOTEL.NS', sector: 'Hotels' },
  { s: 'MAXHEALTH', n: 'Max Healthcare', symbol: 'MAXHEALTH.NS', sector: 'Healthcare' },
  { s: 'JUBLFOOD', n: 'Jubilant FoodWorks', symbol: 'JUBLFOOD.NS', sector: 'Consumer' },
  { s: 'M&MFIN', n: 'M&M Financial', symbol: 'M&MFIN.NS', sector: 'Finance' },
  { s: 'CUMMINSIND', n: 'Cummins India', symbol: 'CUMMINSIND.NS', sector: 'Industrial' },
  { s: 'SYNGENE', n: 'Syngene', symbol: 'SYNGENE.NS', sector: 'Pharma' },
  { s: 'MRF', n: 'MRF', symbol: 'MRF.NS', sector: 'Auto' },
  { s: 'TATACHEM', n: 'Tata Chemicals', symbol: 'TATACHEM.NS', sector: 'Chemicals' },
  { s: 'MSUMI', n: 'Mastek', symbol: 'MSUMI.NS', sector: 'IT' },
  { s: 'BALKRISIND', n: 'Balakrishna Industries', symbol: 'BALKRISIND.NS', sector: 'Auto' },
  { s: 'ASTRAZEN', n: 'Astra Zeneca', symbol: 'ASTRAZEN.NS', sector: 'Pharma' },
  { s: 'ABFRL', n: 'Aditya Birla Fashion', symbol: 'ABFRL.NS', sector: 'Retail' },
  { s: 'IRB', n: 'IRB Infrastructure', symbol: 'IRB.NS', sector: 'Infra' },
  { s: 'GODREJPROP', n: 'Godrej Properties', symbol: 'GODREJPROP.NS', sector: 'Realty' },
  { s: 'SRF', n: 'SRF', symbol: 'SRF.NS', sector: 'Chemicals' },
  { s: 'RAMCOSYS', n: 'Ramco Systems', symbol: 'RAMCOSYS.NS', sector: 'IT' },
  { s: 'NAVINFLUOR', n: 'Navin Fluorine', symbol: 'NAVINFLUOR.NS', sector: 'Chemicals' },
  { s: 'FEDERALBNK', n: 'Federal Bank', symbol: 'FEDERALBNK.NS', sector: 'Banking' },
  { s: 'IEX', n: 'Indian Energy Exchange', symbol: 'IEX.NS', sector: 'Energy' },
  { s: 'CHOLAFIN', n: 'Cholamandalam', symbol: 'CHOLAFIN.NS', sector: 'Finance' },
  { s: 'SRTRANSFIN', n: 'Shriram Transport', symbol: 'SRTRANSFIN.NS', sector: 'Finance' },
  { s: 'VOLTAS', n: 'Voltas', symbol: 'VOLTAS.NS', sector: 'Consumer' },
  { s: 'GRINDWELL', n: 'Grindwell Norton', symbol: 'GRINDWELL.NS', sector: 'Industrial' },
  { s: 'BOSCHLTD', n: 'Bosch', symbol: 'BOSCHLTD.NS', sector: 'Auto' },
  { s: 'JKCEMENT', n: 'JK Cement', symbol: 'JKCEMENT.NS', sector: 'Cement' },
  { s: 'SUNTV', n: 'Sun TV Network', symbol: 'SUNTV.NS', sector: 'Media' },
  { s: 'PAGEIND', n: 'Page Industries', symbol: 'PAGEIND.NS', sector: 'Textiles' },
  { s: 'ALKEM', n: 'Alkem Labs', symbol: 'ALKEM.NS', sector: 'Pharma' },
  { s: 'APOLLOHOSP', n: 'Apollo Hospitals', symbol: 'APOLLOHOSP.NS', sector: 'Healthcare' },
  { s: 'MPHASIS', n: 'Mphasis', symbol: 'MPHASIS.NS', sector: 'IT' },
  { s: 'HAVELLS', n: 'Havells India', symbol: 'HAVELLS.NS', sector: 'Consumer' },
  { s: 'AARTIIND', n: 'Aarti Industries', symbol: 'AARTIIND.NS', sector: 'Chemicals' },
  { s: 'VIPIND', n: 'VIP Industries', symbol: 'VIPIND.NS', sector: 'Consumer' },
  { s: 'NESTLEIND', n: 'Nestle India', symbol: 'NESTLEIND.NS', sector: 'FMCG' },
  { s: 'LUPIN', n: 'Lupin', symbol: 'LUPIN.NS', sector: 'Pharma' },
  { s: 'GLAND', n: 'Gland Pharma', symbol: 'GLAND.NS', sector: 'Pharma' },
  { s: 'LTTS', n: 'LTIMindtree', symbol: 'LTTS.NS', sector: 'IT' },
  { s: 'DABUR', n: 'Dabur', symbol: 'DABUR.NS', sector: 'FMCG' },
  { s: 'BERGEPAINT', n: 'Berger Paints', symbol: 'BERGEPAINT.NS', sector: 'Paints' },
  { s: 'JUBLINGOLD', n: 'Jubilant Ingrevia', symbol: 'JUBLINGOLD.NS', sector: 'Chemicals' },
  { s: 'PVRINOX', n: 'PVR INOX', symbol: 'PVRINOX.NS', sector: 'Entertainment' },
  { s: 'MINDACORP', n: 'Minda Corp', symbol: 'MINDACORP.NS', sector: 'Auto' },
  { s: 'BATAINDIA', n: 'Bata India', symbol: 'BATAINDIA.NS', sector: 'Consumer' },
  { s: 'TRIDENT', n: 'Trident', symbol: 'TRIDENT.NS', sector: 'Textiles' },
  { s: 'BALRAMCHIN', n: 'Balrampur Chini', symbol: 'BALRAMCHIN.NS', sector: 'Agri' },
  { s: 'MOTHERSON', n: 'Samvardhana Motherson', symbol: 'MOTHERSON.NS', sector: 'Auto' },
  { s: 'TATACOMM', n: 'Tata Communications', symbol: 'TATACOMM.NS', sector: 'Telecom' },
  { s: 'MINDTREE', n: 'Mindtree', symbol: 'MINDTREE.NS', sector: 'IT' },
  { s: 'CENTURYPLY', n: 'Century Plyboards', symbol: 'CENTURYPLY.NS', sector: 'Consumer' },
  { s: 'JINDALSTEL', n: 'Jindal Steel', symbol: 'JINDALSTEL.NS', sector: 'Steel' },
  { s: 'NATIONALUM', n: 'National Aluminium', symbol: 'NATIONALUM.NS', sector: 'Metals' },
  { s: 'SJVN', n: 'SJVN', symbol: 'SJVN.NS', sector: 'Power' },
  { s: 'TATAMETALI', n: 'Tata Metaliks', symbol: 'TATAMETALI.NS', sector: 'Metals' },
  { s: 'RADICO', n: 'Radico Khaitan', symbol: 'RADICO.NS', sector: 'Consumer' },
  { s: 'AMBUJACEM', n: 'Ambuja Cements', symbol: 'AMBUJACEM.NS', sector: 'Cement' },
  { s: 'RITES', n: 'RITES', symbol: 'RITES.NS', sector: 'Infra' },
  { s: 'GICRE', n: 'GIC Re', symbol: 'GICRE.NS', sector: 'Insurance' },
  { s: 'RECLTD', n: 'REC', symbol: 'RECLTD.NS', sector: 'Finance' },
  { s: 'NLCINDIA', n: 'NLC India', symbol: 'NLCINDIA.NS', sector: 'Power' },
  { s: 'AUBANK', n: 'AU Small Finance Bank', symbol: 'AUBANK.NS', sector: 'Banking' },
  { s: 'RBLBANK', n: 'RBL Bank', symbol: 'RBLBANK.NS', sector: 'Banking' },
  { s: 'DIXON', n: 'Dixon Technologies', symbol: 'DIXON.NS', sector: 'Electronics' },
  { s: 'THEINDIA CEMENTS', n: 'India Cements', symbol: 'INDIACEM.NS', sector: 'Cement' },
  { s: 'IDFCFIRSTB', n: 'IDFC First Bank', symbol: 'IDFCFIRSTB.NS', sector: 'Banking' },
  { s: 'ZOMATO', n: 'Zomato', symbol: 'ZOMATO.NS', sector: 'Internet' },
  { s: 'PAYTM', n: 'Paytm', symbol: 'PAYTM.NS', sector: 'Internet' },
  { s: 'CESC', n: 'CESC', symbol: 'CESC.NS', sector: 'Power' },
  { s: 'TATAPOWER', n: 'Tata Power', symbol: 'TATAPOWER.NS', sector: 'Power' },
  { s: 'CLEAN', n: 'Clean Science', symbol: 'CLEAN.NS', sector: 'Chemicals' },
  { s: 'RAIN', n: 'Rain Industries', symbol: 'RAIN.NS', sector: 'Chemicals' },
  { s: 'DVL', n: 'DVL', symbol: 'DVL.NS', sector: 'Industrial' },
  { s: 'NATCOPHARM', n: 'Natco Pharma', symbol: 'NATCOPHARM.NS', sector: 'Pharma' },
  { s: 'BASF', n: 'BASF India', symbol: 'BASF.NS', sector: 'Chemicals' },
  { s: 'MCDOWELL-N', n: 'United Spirits', symbol: 'MCDOWELL-N.NS', sector: 'Consumer' },
  { s: 'HINDPETRO', n: 'Hindustan Petroleum', symbol: 'HINDPETRO.NS', sector: 'Energy' },
  { s: 'BANDHANBNK', n: 'Bandhan Bank', symbol: 'BANDHANBNK.NS', sector: 'Banking' },
  { s: 'YESBANK', n: 'Yes Bank', symbol: 'YESBANK.NS', sector: 'Banking' },
  { s: 'ICICIPRULI', n: 'ICICI Prudential', symbol: 'ICICIPRULI.NS', sector: 'Insurance' },
  { s: 'SBICARD', n: 'SBI Cards', symbol: 'SBICARD.NS', sector: 'Finance' },
  { s: 'CUB', n: 'City Union Bank', symbol: 'CUB.NS', sector: 'Banking' },
  { s: 'KPRMILL', n: 'KP R Mill', symbol: 'KPRMILL.NS', sector: 'Textiles' }
]

const SMALL_CAP_STOCKS = [
  { s: 'KAYNES', n: 'Kaynes Technology', symbol: 'KAYNES.NS', sector: 'Electronics' },
  { s: 'NETWEB', n: 'Netweb Technologies', symbol: 'NETWEB.NS', sector: 'Technology' },
  { s: 'KPITTECH', n: 'KPIT Technologies', symbol: 'KPITTECH.NS', sector: 'Auto Tech' },
  { s: 'CDSL', n: 'CDSL', symbol: 'CDSL.NS', sector: 'Markets' },
  { s: 'MCX', n: 'Multi Commodity Exchange', symbol: 'MCX.NS', sector: 'Exchange' },
  { s: 'TTML', n: 'TTM Technologies', symbol: 'TTML.NS', sector: 'Telecom' },
  { s: 'NELCO', n: 'NELCO', symbol: 'NELCO.NS', sector: 'Electronics' },
  { s: 'KEI', n: 'KEI Industries', symbol: 'KEI.NS', sector: 'Electrical' },
  { s: 'ASTEC', n: 'Aster DM Health', symbol: 'ASTEC.NS', sector: 'Healthcare' },
  { s: 'VAIBHAV', n: 'Vaibhav Global', symbol: 'VAIBHAVGLBL.NS', sector: 'Retail' },
  { s: 'STRTECH', n: 'Sterling Tools', symbol: 'STRTECH.NS', sector: 'Auto' },
  { s: 'WELSPUNIND', n: 'Welspun India', symbol: 'WELSPUNIND.NS', sector: 'Textiles' },
  { s: 'JCHAC', n: 'Jain Irrigation', symbol: 'JCHAC.NS', sector: 'Agri' },
  { s: 'NOCIL', n: 'NOCIL', symbol: 'NOCIL.NS', sector: 'Chemicals' },
  { s: 'GFLLIMITED', n: 'GFL', symbol: 'GFLLIMITED.NS', sector: 'Finance' },
  { s: 'ITI', n: 'ITI Ltd', symbol: 'ITI.NS', sector: 'Telecom' },
  { s: 'BEML', n: 'BEML', symbol: 'BEML.NS', sector: 'Industrial' },
  { s: 'ZALE', n: 'Zee Learn', symbol: 'ZEELEARN.NS', sector: 'Education' },
  { s: 'RITES', n: 'RITES', symbol: 'RITES.NS', sector: 'Infra' },
  { s: 'SAIL', n: 'SAIL', symbol: 'SAIL.NS', sector: 'Steel' },
  { s: 'GOVINDFN', n: 'Govind Rubber', symbol: 'GOVINDFN.NS', sector: 'Industrial' },
  { s: 'MMTC', n: 'MMTC', symbol: 'MMTC.NS', sector: 'Trading' },
  { s: 'UNICHEMLAB', n: 'Unichem Laboratories', symbol: 'UNICHEMLAB.NS', sector: 'Pharma' },
  { s: 'NIPPOBATRY', n: 'Nippon India', symbol: 'NIPPOBATRY.NS', sector: 'Auto' },
  { s: 'RALLIS', n: 'Rallis India', symbol: 'RALLIS.NS', sector: 'Agri' },
  { s: 'MATRIBHUN', n: 'Matriline', symbol: 'MATRIBHUN.NS', sector: 'Media' },
  { s: 'SEQUENT', n: 'Sequent Scientific', symbol: 'SEQUENT.NS', sector: 'Pharma' },
  { s: 'ROUTE', n: 'Route Mobile', symbol: 'ROUTE.NS', sector: 'Telecom' },
  { s: 'HDFCSENS', n: 'HDFC Securities', symbol: 'HDFCSENS.NS', sector: 'Finance' },
  { s: 'MINDTREE', n: 'Mindtree', symbol: 'MINDTREE.NS', sector: 'IT' },
  { s: 'SIS', n: 'SIS Ltd', symbol: 'SIS.NS', sector: 'Logistics' },
  { s: 'FINEORG', n: 'Fine Organic', symbol: 'FINEORG.NS', sector: 'Chemicals' },
  { s: 'SCHAEFFLER', n: 'Schaeffler India', symbol: 'SCHAEFFLER.NS', sector: 'Auto' },
  { s: 'CERA', n: 'Cera Sanitaryware', symbol: 'CERA.NS', sector: 'Consumer' },
  { s: 'ARVINDFASN', n: 'Arvind Fashions', symbol: 'ARVINDFASN.NS', sector: 'Fashion' },
  { s: 'UJJIVAN', n: 'Ujjivan Small Finance Bank', symbol: 'UJJIVAN.NS', sector: 'Banking' },
  { s: 'MGL', n: 'Mahanagar Gas', symbol: 'MGL.NS', sector: 'Energy' },
  { s: 'TANLA', n: 'Tanla Platforms', symbol: 'TANLA.NS', sector: 'IT' },
  { s: 'CAMS', n: 'Computer Age Management', symbol: 'CAMS.NS', sector: 'Finance' },
  { s: 'PPL', n: 'PPL', symbol: 'PPL.NS', sector: 'Energy' },
  { s: 'BAYERCROP', n: 'Bayer CropScience', symbol: 'BAYERCROP.NS', sector: 'Agri' },
  { s: 'AARTIIND', n: 'Aarti Industries', symbol: 'AARTIIND.NS', sector: 'Chemicals' },
  { s: 'KNRCON', n: 'KNR Constructions', symbol: 'KNRCON.NS', sector: 'Infra' },
  { s: 'IIFL', n: 'IIFL Finance', symbol: 'IIFL.NS', sector: 'Finance' },
  { s: 'PLASTIBLENDS', n: 'Plastiblends India', symbol: 'PLASTIBLEN.NS', sector: 'Chemicals' },
  { s: 'VSTIND', n: 'VST Industries', symbol: 'VSTIND.NS', sector: 'Consumer' },
  { s: 'TARSONS', n: 'Tarsons Products', symbol: 'TARSONS.NS', sector: 'Healthcare' },
  { s: 'KIOCL', n: 'KIOCL', symbol: 'KIOCL.NS', sector: 'Mining' },
  { s: 'KSB', n: 'Ksb India', symbol: 'KSB.NS', sector: 'Industrial' },
  { s: 'M&M', n: 'M&M', symbol: 'M&M.NS', sector: 'Auto' },
  { s: 'GODREJAGRO', n: 'Godrej Agrovet', symbol: 'GODREJAGRO.NS', sector: 'Agri' },
  { s: 'HEG', n: 'HEG', symbol: 'HEG.NS', sector: 'Materials' },
  { s: 'JKLAKSHMI', n: 'JK Lakshmi Cement', symbol: 'JKLAKSHMI.NS', sector: 'Cement' },
  { s: 'VBL', n: 'Varun Beverages', symbol: 'VBL.NS', sector: 'Consumer' },
  { s: 'EIHOTEL', n: 'EIH Hotels', symbol: 'EIHOTEL.NS', sector: 'Hotels' },
  { s: 'TIDEWATER', n: 'Tide Water Oil', symbol: 'TIDEWATER.NS', sector: 'Energy' },
  { s: 'IGL', n: 'Indraprastha Gas', symbol: 'IGL.NS', sector: 'Energy' },
  { s: 'GABRIEL', n: 'Gabriel India', symbol: 'GABRIEL.NS', sector: 'Auto' },
  { s: 'TATVA', n: 'Tatva Chintan', symbol: 'TATVA.NS', sector: 'Chemicals' },
  { s: 'AMARAJABAT', n: 'Amara Raja Batteries', symbol: 'AMARAJABAT.NS', sector: 'Auto' },
  { s: 'TARAK', n: 'Triveni Engineering', symbol: 'TARAK.NS', sector: 'Industrial' },
  { s: 'MOL', n: 'Mahanagar Telephone', symbol: 'MOL.NS', sector: 'Telecom' },
  { s: 'ORCHPHARMA', n: 'Orchid Pharma', symbol: 'ORCHPHARMA.NS', sector: 'Pharma' },
  { s: 'REDINGTON', n: 'Redington', symbol: 'REDINGTON.NS', sector: 'Distribution' },
  { s: 'BIRLACORPN', n: 'Birla Corporation', symbol: 'BIRLACORPN.NS', sector: 'Cement' },
  { s: 'MAGMA', n: 'Magma HDI', symbol: 'MAGMA.NS', sector: 'Insurance' },
  { s: 'MUTHOOTCAP', n: 'Muthoot Capital', symbol: 'MUTHOOTCAP.NS', sector: 'Finance' },
  { s: 'NIFTY', n: 'Nifty', symbol: 'NIFTY.NS', sector: 'Index' },
  { s: 'MSTCLTD', n: 'Mstc', symbol: 'MSTCLTD.NS', sector: 'Trading' },
  { s: 'JYOTHYLAB', n: 'Jyothy Labs', symbol: 'JYOTHYLAB.NS', sector: 'Consumer' },
  { s: 'TTKPRESTIG', n: 'TTK Prestige', symbol: 'TTKPRESTIG.NS', sector: 'Consumer' },
  { s: 'SRF', n: 'SRF', symbol: 'SRF.NS', sector: 'Chemicals' },
  { s: 'CASTROLIND', n: 'Castrol India', symbol: 'CASTROLIND.NS', sector: 'Energy' },
  { s: 'GLOBUSSPR', n: 'Globus Spirits', symbol: 'GLOBUSSPR.NS', sector: 'Consumer' },
  { s: 'SWSOLAR', n: 'Sterling & Wilson', symbol: 'SWSOLAR.NS', sector: 'Energy' },
  { s: 'AHLUSTRAL', n: 'Ahlada', symbol: 'AHLUSTRAL.NS', sector: 'Industrial' },
  { s: 'PILANIINVS', n: 'Pilani Investment', symbol: 'PILANIINVS.NS', sector: 'Finance' },
  { s: 'GABRIEL', n: 'Gabriel India', symbol: 'GABRIEL.NS', sector: 'Auto' },
  { s: 'TEJASNET', n: 'Tejas Networks', symbol: 'TEJASNET.NS', sector: 'Telecom' },
  { s: 'HBSL', n: 'Himadri Speciality', symbol: 'HBSL.NS', sector: 'Chemicals' },
  { s: 'LUXIND', n: 'Lux Industries', symbol: 'LUXIND.NS', sector: 'Textiles' },
  { s: 'NILKAMAL', n: 'Nilkamal', symbol: 'NILKAMAL.NS', sector: 'Consumer' },
  { s: 'AIAENG', n: 'AIA Engineering', symbol: 'AIAENG.NS', sector: 'Industrial' },
  { s: 'SANDHAR', n: 'Sandhar Technologies', symbol: 'SANDHAR.NS', sector: 'Auto' },
  { s: 'INDIAMART', n: 'IndiaMART', symbol: 'INDIAMART.NS', sector: 'Internet' },
  { s: 'CIGNITITEC', n: 'Cigniti', symbol: 'CIGNITITEC.NS', sector: 'IT' },
  { s: 'NESCO', n: 'Nesco', symbol: 'NESCO.NS', sector: 'Industrial' },
  { s: 'BHEL', n: 'Bharat Heavy Electricals', symbol: 'BHEL.NS', sector: 'Industrial' },
  { s: 'TV18BRDCST', n: 'TV18 Broadcast', symbol: 'TV18BRDCST.NS', sector: 'Media' },
  { s: 'PODIL', n: 'Podil', symbol: 'PODIL.NS', sector: 'Industrial' }
]

const dedupeBySymbol = (stocks) => {
  const unique = new Map()
  stocks.forEach(stock => {
    if (!unique.has(stock.symbol)) {
      unique.set(stock.symbol, { ...stock })
    }
  })
  return [...unique.values()]
}

const STOCK_CONFIG = dedupeBySymbol([
  ...LARGE_CAP_STOCKS.map(stock => ({ ...stock, c: 'Large Cap' })),
  ...MID_CAP_STOCKS.map(stock => ({ ...stock, c: 'Mid Cap' })),
  ...SMALL_CAP_STOCKS.map(stock => ({ ...stock, c: 'Small Cap' }))
])

const MAX_ANALYSIS_STOCKS = 1000
const ANALYSIS_CONCURRENCY = 8

const resolveSector = stock => {
  const symbol = String(stock.symbol || stock.s || '').toUpperCase()
  if (symbol === 'FILATEX' || symbol === 'FILATEX.NS') return 'Textiles'
  if (stock.sector && !['Other', 'Unclassified'].includes(stock.sector)) return stock.sector
  const configuredStock = STOCK_CONFIG.find(item => item.symbol === stock.symbol || item.s === stock.s)
  if (configuredStock?.sector) return configuredStock.sector
  const text = `${stock.s || ''} ${stock.n || ''}`.toLowerCase()
  const sectorKeywords = [
    ['bank', 'Banking'],
    ['insurance|life insurance|general insurance', 'Insurance'],
    ['finance|financial|capital|credit|housing|invest', 'Finance'],
    ['pharma|medical|health|hospital|diagnostic', 'Healthcare'],
    ['software|technology|tech|digital|infotech|systems', 'IT'],
    ['power|energy|oil|gas|petro|coal|solar', 'Energy'],
    ['steel|metal|aluminium|mining|cement', 'Metals & Mining'],
    ['chemical|specialit|fertilizer|agri|pesticide', 'Chemicals'],
    ['textile|synthetic yarn|fabric|garment|apparel|spinning', 'Textiles'],
    ['motor|auto|tyre|vehicle', 'Auto'],
    ['telecom|airtel|communication', 'Telecom'],
    ['realty|real estate|properties|developer', 'Realty'],
    ['media|broadcast|entertainment|film', 'Media'],
    ['hotel|hospitality|tourism|travel|aviation|airline', 'Travel & Hospitality'],
    ['food|consumer|fmcg|jewel|retail', 'Consumer'],
    ['defence|electronics|industrial|engineering|infra', 'Industrial']
  ]
  return sectorKeywords.find(([keywords]) => new RegExp(keywords).test(text))?.[1] || 'Unclassified'
}

const getStockDescription = stock => {
  const profiles = {
    FILATEX: 'Filatex India Limited manufactures synthetic textile yarns, including polyester-based yarns, used by downstream textile and fabric manufacturers.'
  }
  const symbol = String(stock.symbol || stock.s || '').toUpperCase().replace(/\.(NS|BO)$/, '')
  if (profiles[symbol]) return profiles[symbol]

  const descriptions = {
    Banking: 'Provides banking, lending, deposit, and related financial services to individuals and businesses.',
    Finance: 'Operates in financial services such as lending, investment, insurance, or capital markets.',
    'Financial Services': 'Provides financial products and services such as lending, investment, insurance, or capital markets.',
    IT: 'Delivers software, technology, digital, or information services to business and consumer clients.',
    'Information Technology': 'Delivers software, technology, digital, or information services to business and consumer clients.',
    Energy: 'Operates across energy production, distribution, equipment, or related infrastructure.',
    'Oil Gas & Consumable Fuels': 'Operates across oil, gas, refining, fuel distribution, or related energy infrastructure.',
    Auto: 'Designs, manufactures, distributes, or supports vehicles and automotive components.',
    'Automobile and Auto Components': 'Designs, manufactures, distributes, or supports vehicles and automotive components.',
    Telecom: 'Provides telecommunications, connectivity, network, or communications services.',
    Telecommunication: 'Provides telecommunications, connectivity, network, or communications services.',
    Healthcare: 'Provides healthcare products, pharmaceuticals, diagnostics, or medical services.',
    Pharmaceuticals: 'Develops, manufactures, or markets pharmaceutical and healthcare products.',
    Consumer: 'Serves consumer demand through branded products, retail, food, or household services.',
    Textiles: 'Operates in textile manufacturing, yarn, fabric, apparel, or other textile-related products.',
    'Consumer Durables': 'Makes durable consumer products and household or lifestyle equipment.',
    'Fast Moving Consumer Goods': 'Makes and distributes frequently purchased consumer, food, household, or personal-care products.',
    'Food Beverage Tobacco': 'Produces or distributes food, beverage, or tobacco products.',
    Retail: 'Sells products and services directly to consumers through organised or specialised retail channels.',
    Chemicals: 'Manufactures and distributes industrial, specialty, agricultural, or consumer chemicals.',
    Construction: 'Develops, builds, or manages construction and infrastructure projects.',
    'Construction Materials': 'Manufactures materials used in construction, buildings, and infrastructure.',
    Capital: 'Manufactures industrial equipment, machinery, electrical goods, or other capital products.',
    'Capital Goods': 'Manufactures industrial equipment, machinery, electrical goods, or other capital products.',
    'Metals & Mining': 'Operates in mining, metals, steel, cement, or other materials and industrial commodities.',
    'Metals & Minerals': 'Operates in mining, metals, steel, or other mineral and industrial commodities.',
    Power: 'Generates, transmits, distributes, or supplies electricity and related power services.',
    Realty: 'Develops, owns, leases, or manages residential, commercial, or other real-estate assets.',
    'Media Entertainment & Publication': 'Creates, broadcasts, publishes, or distributes media and entertainment content.',
    Media: 'Creates, broadcasts, publishes, or distributes media and entertainment content.',
    Services: 'Provides business, consumer, logistics, professional, or other service activities.',
    'Travel & Hospitality': 'Provides travel, hotel, hospitality, tourism, or aviation-related services.',
    Industrial: 'Provides industrial products, engineering, equipment, infrastructure, or manufacturing services.'
  }
  const sector = resolveSector(stock)
  const description = descriptions[sector] || descriptions[Object.keys(descriptions).find(key => sector.toLowerCase().includes(key.toLowerCase()))]
  return `${stock.n || stock.s} is classified in the ${sector.toLowerCase()} sector. ${description || 'Its business details should be confirmed from the latest exchange filings and annual report.'}`
}

const getStockSummary = stock => {
  const name = stock.n || stock.s || 'This stock'
  const sector = resolveSector(stock)
  const trend = stock.marketStructure?.trend || 'Neutral'
  const pattern = stock.pattern?.type || 'Consolidation'
  const intradayBias = stock.intradayBias || 'Neutral'
  const swingBias = stock.swingBias || 'Neutral'
  const pricePosition = Number.isFinite(Number(stock.currentPrice)) && Number.isFinite(Number(stock.vwap))
    ? Number(stock.currentPrice) >= Number(stock.vwap) ? 'above' : 'below'
    : null
  const vwapText = pricePosition ? ` Price is ${pricePosition} VWAP.` : ''
  return `${name} is a ${sector.toLowerCase()} stock. The current technical setup shows a ${trend.toLowerCase()} trend with a ${pattern.toLowerCase()} pattern. Intraday bias is ${intradayBias.toLowerCase()} and swing bias is ${swingBias.toLowerCase()}.${vwapText}`
}

const formatChange = value => {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return 'N/A'
  return numericValue !== 0 && Math.abs(numericValue) < 0.01 ? numericValue.toFixed(3) : numericValue.toFixed(2)
}

const getScreenerCheck = stock => ({
  marketCap: Number(stock.marketCap) > 20000000000,
  priceAbove200Dma: stock.currentPrice > stock.dma200,
  priceAbove50Dma: stock.currentPrice > stock.dma50,
  dma50Above200: stock.dma50 > stock.dma200,
  dma20Above50: stock.dma20 > stock.dma50,
  rsiRange: stock.rsi >= 55 && stock.rsi <= 70,
  volume: stock.currentVolume > 1.5 * stock.averageVolume20,
  previous20High: stock.currentPrice > stock.previous20High,
  near52WeekHigh: stock.currentPrice >= stock.high52 * 0.9,
  tradedValue: stock.averageTradedValue > 50000000
})

const matchesScreener = stock => Object.values(getScreenerCheck(stock)).every(Boolean)

const BROKER_PROFILES = [
  { name: 'Axis Securities', url: 'https://www.axisdirect.in/', style: 'Momentum desk', horizon: '1-3 weeks', bias: 1.05 },
  { name: 'Motilal Oswal', url: 'https://www.motilaloswal.com/', style: 'Swing desk', horizon: '2-6 weeks', bias: 1.1 },
  { name: 'ICICI Securities', url: 'https://www.icicidirect.com/', style: 'Trend desk', horizon: '1-3 months', bias: 1 },
  { name: 'HDFC Securities', url: 'https://hdfcsky.com/', style: 'Risk-managed desk', horizon: '2-4 weeks', bias: 0.95 },
  { name: 'Kotak Securities', url: 'https://www.kotaksecurities.com/', style: 'Technical desk', horizon: '1-2 months', bias: 1.08 },
  { name: 'Sharekhan', url: 'https://www.sharekhan.com/', style: 'Positional desk', horizon: '1-3 months', bias: 0.98 },
  { name: 'Upstox', url: 'https://upstox.com/', style: 'Digital investing', horizon: 'Flexible', bias: 1 },
  { name: 'Zerodha', url: 'https://zerodha.com/', style: 'Self-directed trading', horizon: 'Flexible', bias: 1 }
]

const CHART_TIMEFRAMES = {
  day: { label: '1D', range: '1d', interval: '5m', detail: '1 day · 5 min' },
  fiveDays: { label: '5D', range: '5d', interval: '15m', detail: '5 days · 15 min' },
  oneMonth: { label: '1M', range: '1mo', interval: '1h', detail: '1 month · hourly' },
  threeMonths: { label: '3M', range: '3mo', interval: '1d', detail: '3 months · daily' },
  sixMonths: { label: '6M', range: '6mo', interval: '1d', detail: '6 months · daily' },
  ytd: { label: 'YTD', range: 'ytd', interval: '1d', detail: 'year to date · daily' },
  oneYear: { label: '1Y', range: '1y', interval: '1d', detail: '1 year · daily' },
  twoYears: { label: '2Y', range: '2y', interval: '1wk', detail: '2 years · weekly' },
  fiveYears: { label: '5Y', range: '5y', interval: '1wk', detail: '5 years · weekly' },
  max: { label: 'MAX', range: 'max', interval: '1mo', detail: 'maximum history · monthly' }
}

const fetchHistoricalData = async (symbol, range = '5y', interval = '1d') => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  const requestUrl = `${apiBaseUrl}/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&events=div`
  let lastError

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      let response
      try {
        response = await fetch(requestUrl, { signal: controller.signal })
      } finally {
        clearTimeout(timeoutId)
      }

      if (!response.ok) {
        const details = await response.text().catch(() => '')
        throw new Error(`Chart API returned ${response.status}${details ? `: ${details.slice(0, 120)}` : ''}`)
      }

      const json = await response.json()
      const result = json?.chart?.result?.[0]
      if (!result) return null
    
      const timestamps = result.timestamp || []
      const quote = result.indicators?.quote?.[0] || {}
      const opens = quote.open || []
      const highs = quote.high || []
      const lows = quote.low || []
      const closes = quote.close || []
      const volumes = quote.volume || []

      // Yahoo can return nulls for any OHLCV field. Keep only complete rows so
      // timestamps and indicator inputs cannot become misaligned.
      const validIndexes = closes
        .map((close, index) => {
          const values = [timestamps[index], opens[index], highs[index], lows[index], close, volumes[index]]
          return values.every(value => Number.isFinite(Number(value))) ? index : null
        })
        .filter(index => index !== null)

      if (validIndexes.length < 2) return null

      const safeSlice = (arr) => validIndexes.map(index => Number(arr[index]))

      return {
        timestamps: safeSlice(timestamps),
        opens: safeSlice(opens),
        highs: safeSlice(highs),
        lows: safeSlice(lows),
        closes: safeSlice(closes),
        volumes: safeSlice(volumes),
        meta: result.meta,
        dividends: Object.entries(result.events?.dividends || {}).map(([timestamp, event]) => ({
          date: Number(timestamp),
          amount: Number(event?.amount || 0),
          type: event?.type || 'Cash Dividend'
        }))
      }
    } catch (error) {
      lastError = error
      if (attempt < 2) continue
    }
  }

  console.warn(`Failed to fetch ${symbol}:`, lastError)
  return null
}

const fetchFinancials = async (symbol) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  try {
    const response = await fetch(`${apiBaseUrl}/financials/${encodeURIComponent(symbol)}`)
    if (!response.ok) throw new Error(`Financials API returned ${response.status}`)
    return await response.json()
  } catch (error) {
    console.warn(`Failed to fetch financials for ${symbol}:`, error)
    return null
  }
}

const formatFinancialNumber = (value, options = {}) => {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) {
    const { percent = false, currency = false } = options
    if (percent) return '0.0%'
    if (currency) return '₹0'
    return '0'
  }
  const { percent = false, currency = false } = options
  if (percent) return `${(Number(value) * 100).toFixed(1)}%`
  if (currency) return `₹${new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value))}`
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(value))
}

const financialTone = value => Number.isFinite(Number(value)) && Number(value) >= 0 ? 'positive' : 'negative'

const calculateProfitProbability = (stock, articles = []) => {
  const technical = Number(stock.technicalScore || 0) * 0.35
  const dvm = Number(stock.dvm?.score || 50) * 0.2
  const pattern = stock.pattern?.direction === 'Bullish' ? 75 : stock.pattern?.direction === 'Bearish' ? 25 : 50
  const change = Math.max(0, Math.min(100, 50 + Number(stock.change || 0) * 5))
  const volume = stock.volumeAnalysis?.rvol >= 1 ? Math.min(100, 55 + stock.volumeAnalysis.rvol * 10) : 42
  const indicators = stock.intradayBias === 'Bullish' && stock.swingBias === 'Bullish' ? 78 : stock.intradayBias === 'Bearish' && stock.swingBias === 'Bearish' ? 22 : 50
  const news = articles.length ? (articles.some(article => /profit|upgrade|order|approval|surge|buyback/i.test(article.title)) ? 70 : 35) : 50
  return Math.round(Math.max(5, Math.min(95, technical + dvm + pattern * 0.1 + change * 0.1 + volume * 0.1 + indicators * 0.1 + news * 0.05)))
}

const getIpoNews = (ipo, articles = []) => {
  const ignoredWords = new Set(['india', 'indian', 'limited', 'ltd', 'private', 'public', 'company', 'corporation', 'corporate', 'holdings', 'technologies', 'technology', 'solutions', 'engineering', 'industries'])
  const keywords = [ipo.symbol, ipo.company]
    .flatMap(value => String(value || '').split(/[^a-z0-9]+/i))
    .map(value => value.toLowerCase())
    .filter(value => value.length > 3 && !ignoredWords.has(value))
  return articles.filter(article => {
    const text = `${article.title} ${article.description}`.toLowerCase()
    return keywords.some(keyword => text.includes(keyword))
  })
}

const getIpoListingEstimate = (ipo, articles = []) => {
  if (ipo.status === 'Listed' && ipo.listingPrice && ipo.listingPrice !== 'Not disclosed') {
    return { estimate: ipo.listingPrice, sentiment: 'Listed', confidence: 100, newsCount: 0 }
  }
  const prices = String(ipo.priceRange || '').match(/\d+(?:\.\d+)?/g)?.map(Number) || []
  const baseline = prices.length > 1 ? (prices[0] + prices[1]) / 2 : prices[0]
  const relatedNews = getIpoNews(ipo, articles)
  const positiveNews = /strong demand|oversubscription|oversubscri|premium|grey market|gmp|profit|growth|order|expansion|partnership|record|surge|upgrade|buy/i
  const negativeNews = /weak demand|undersubscri|loss|debt|risk|fraud|delay|penalty|rejection|concern|fall|drop|downgrade/i
  const positiveCount = relatedNews.filter(article => positiveNews.test(`${article.title} ${article.description}`)).length
  const negativeCount = relatedNews.filter(article => negativeNews.test(`${article.title} ${article.description}`)).length
  const sentiment = positiveCount > negativeCount ? 'Positive' : negativeCount > positiveCount ? 'Cautious' : relatedNews.length ? 'Mixed' : 'No direct news'
  const adjustment = sentiment === 'Positive' ? 0.08 : sentiment === 'Cautious' ? -0.08 : 0
  return {
    estimate: Number.isFinite(baseline) ? `₹${(baseline * (1 + adjustment)).toFixed(2)}` : 'Not enough price data',
    sentiment,
    confidence: relatedNews.length ? Math.min(80, 45 + relatedNews.length * 8) : 20,
    newsCount: relatedNews.length
  }
}

const getStockProsCons = (stock, financials) => {
  const pros = []
  const cons = []
  const performance = financials?.performance || {}
  const valuation = financials?.valuation || {}
  const balanceSheet = financials?.balanceSheet || {}
  if (stock.dvm?.durability >= 60) pros.push('Strong durability score from business and balance-sheet signals')
  if (stock.dvm?.valuation >= 60) pros.push('Attractive valuation score relative to available price metrics')
  if (stock.dvm?.momentum >= 60) pros.push(`${stock.pattern?.type || 'Positive pattern'} with supportive momentum`)
  if (stock.currentPrice > stock.vwap) pros.push('Trading above VWAP, showing positive demand')
  if (stock.volumeAnalysis?.rvol >= 1.5) pros.push('Strong relative volume confirms market participation')
  if (Number(performance.revenueGrowth) > 0) pros.push('Revenue growth is positive in the latest available data')
  if (stock.dvm?.durability < 45) cons.push('Durability score is weak; review earnings, debt, and cash flow')
  if (stock.dvm?.valuation < 45) cons.push('Valuation score is weak or the stock is extended in its range')
  if (stock.dvm?.momentum < 45) cons.push('Momentum is soft and trend confirmation is limited')
  if (stock.rsi > 70) cons.push('RSI is overbought, increasing pullback risk')
  if (stock.rsi < 30) cons.push('RSI is oversold and may signal continued weakness')
  if (stock.currentPrice < stock.vwap) cons.push('Trading below VWAP, indicating weaker short-term demand')
  if (Number(valuation.pe) > 40) cons.push('High P/E ratio leaves less room for valuation disappointment')
  if (Number(balanceSheet.debtToEquity) > 100) cons.push('High debt-to-equity increases financial risk')
  return { pros: pros.slice(0, 4), cons: cons.slice(0, 4) }
}

const getRelatedNews = (stock, articles) => articles.filter(article => {
  const text = `${article.title} ${article.description}`.toLowerCase()
  return [stock.s, stock.n, stock.symbol.replace(/\.(NS|BO)$/, '')].some(keyword => keyword && text.includes(keyword.toLowerCase()))
})

function MarketAlerts({ alerts, loading, error }) {
  return <section className="card analysis-section market-alerts">
    <div className="dividend-heading"><div><h2>MARKET ALERTS</h2><p>High-impact NSE corporate actions and market headlines refreshed every minute.</p></div><span className="dividend-count">{alerts.length} alerts</span></div>
    <div className="alert-disclaimer"><AlertCircle size={15} /> Signals are informational only. They are not guaranteed profit predictions or buy recommendations.</div>
    {loading && !alerts.length ? <div className="no-results">Checking NSE and market feeds...</div> : error ? <div className="no-results">{error}</div> : !alerts.length ? <div className="no-results">No high-impact alerts found in the latest update.</div> : <div className="alert-list">{alerts.map((alert, index) => <article className={`alert-item ${alert.severity}`} key={`${alert.link}-${index}`}><div className="alert-item-head"><span className="alert-severity">{alert.severity === 'high' ? 'HIGH IMPACT' : 'WATCH'}</span><span>{alert.source}</span><time>{alert.publishedAt ? new Date(alert.publishedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Just now'}</time></div><a href={alert.link} target="_blank" rel="noreferrer">{alert.title}</a>{alert.description && <p>{alert.description.slice(0, 220)}</p>}</article>)}</div>}
  </section>
}

const clampScore = (value) => Math.round(Math.min(100, Math.max(0, value)))
const getDvmTone = (score = 0) => score >= 55 ? 'green' : score >= 40 ? 'orange' : 'red'
const getPatternClass = pattern => `${pattern.direction.toLowerCase()} ${pattern.type.toLowerCase().replace(/\s+/g, '-')}`
const getDvmStatus = (dvm) => {
  if (dvm?.isStrongPerformer) return 'Strong Performer'
  if ((dvm?.score || 0) >= 55) return 'Positive'
  if ((dvm?.score || 0) >= 40) return 'Watch'
  return 'Weak'
}

const CandlestickShape = ({ x, y, width, height, payload }) => {
  const { open, high, low, close } = payload || {}
  if (![x, y, width, height, open, high, low, close].every(Number.isFinite) || high <= low) return null

  const scale = height / (high - low)
  const openY = y + (high - open) * scale
  const closeY = y + (high - close) * scale
  const bullish = close >= open
  const color = bullish ? '#079f87' : '#df5d62'
  const bodyY = Math.min(openY, closeY)
  const bodyHeight = Math.max(1.5, Math.abs(closeY - openY))
  const bodyWidth = Math.max(2, width * 0.68)
  const centerX = x + width / 2

  return <g>
    <line x1={centerX} x2={centerX} y1={y} y2={y + height} stroke={color} strokeWidth={1.2} />
    <rect x={centerX - bodyWidth / 2} y={bodyY} width={bodyWidth} height={bodyHeight} rx={1} fill={color} />
  </g>
}

const CandlestickTooltip = ({ active, payload }) => {
  const candle = payload?.[0]?.payload
  if (!active || !candle) return null
  return <div className="candle-tooltip">
    <strong>{candle.name}</strong>
    <span>O ₹{candle.open.toFixed(2)} · H ₹{candle.high.toFixed(2)}</span>
    <span>L ₹{candle.low.toFixed(2)} · C ₹{candle.close.toFixed(2)}</span>
  </div>
}

// DVM model: Durability, Valuation, and Momentum. Financial fields are used when
// available; neutral proxies keep the score honest when a stock has no fundamentals.
const calculateDvmScore = ({ currentPrice, high52, low52, change, rsi, macd, signal, macdHistogram, adx, ema20, ema50, ema200, marketStructure, volumeAnalysis, financials }) => {
  const performance = financials?.performance || {}
  const balanceSheet = financials?.balanceSheet || {}
  const valuationData = financials?.valuation || {}
  const financialScore = (value, good, bad, fallback = 50) => Number.isFinite(Number(value)) ? value >= good ? 80 : value <= bad ? 20 : 50 + ((value - bad) / (good - bad)) * 30 : fallback
  const debtScore = Number.isFinite(Number(balanceSheet.debtToEquity)) ? clampScore(90 - Math.min(70, Math.max(0, Number(balanceSheet.debtToEquity)))) : 50
  const cashFlowScore = Number.isFinite(Number(balanceSheet.freeCashFlow)) ? Number(balanceSheet.freeCashFlow) > 0 ? 75 : 25 : 50
  const durability = clampScore((financialScore(performance.revenueGrowth, 0.1, -0.1) + financialScore(performance.earningsGrowth, 0.1, -0.1) + financialScore(performance.profitMargin, 0.15, 0) + debtScore + cashFlowScore) / 5)
  const peScore = Number.isFinite(Number(valuationData.pe)) && Number(valuationData.pe) > 0 ? Number(valuationData.pe) <= 15 ? 80 : Number(valuationData.pe) >= 40 ? 20 : 50 : null
  const pbScore = Number.isFinite(Number(valuationData.priceToBook)) && Number(valuationData.priceToBook) > 0 ? Number(valuationData.priceToBook) <= 2 ? 75 : Number(valuationData.priceToBook) >= 6 ? 25 : 50 : null
  const range = high52 - low52
  const rangePosition = range > 0 ? (currentPrice - low52) / range : 0.5
  const rangeFallback = clampScore(80 - rangePosition * 45)
  const valuation = clampScore([peScore, pbScore].filter(Number.isFinite).length ? [peScore, pbScore].filter(Number.isFinite).reduce((total, value) => total + value, 0) / [peScore, pbScore].filter(Number.isFinite).length : rangeFallback)
  const rsiScore = rsi >= 55 && rsi <= 70 ? 75 : rsi >= 45 && rsi < 55 ? 55 : rsi > 70 ? 45 : rsi >= 30 ? 35 : 20
  const emaScore = (currentPrice > ema20 ? 20 : 0) + (ema20 > ema50 ? 20 : 0) + (ema50 > ema200 ? 20 : 0)
  const patternScore = marketStructure?.trend === 'Uptrend' ? 80 : marketStructure?.trend === 'Downtrend' ? 25 : 50
  const volumeScore = volumeAnalysis?.rvol >= 1 ? 70 : 35
  const momentum = clampScore((rsiScore + (macd > signal ? 75 : 30) + (macdHistogram > 0 ? 70 : 30) + Math.max(10, Math.min(90, 50 + Number(change || 0) * 5)) + emaScore + patternScore + volumeScore) / 7)
  const score = clampScore((durability + valuation + momentum) / 3)

  return { durability, valuation, momentum, score, isStrongPerformer: durability >= 55 && valuation >= 55 && momentum >= 55 && score >= 55, methodology: { durability: 'Revenue, earnings, margin, debt, and cash-flow strength', valuation: 'P/E, P/BV, and 52-week value proxy', momentum: 'RSI, EMA trend, MACD, volume, and pattern direction' } }
}

const analyzeStock = async (stock) => {
  const [data, intradayData] = await Promise.all([
    fetchHistoricalData(stock.symbol),
    fetchHistoricalData(stock.symbol, '1d', '5m')
  ])
  if (!data) return null
  
  const { closes, highs, lows, volumes, meta, dividends } = data
  if (!closes || closes.length < 30) return null

  const livePrice = Number(intradayData?.meta?.regularMarketPrice)
  const currentPrice = Number.isFinite(livePrice) && livePrice > 0 ? livePrice : Number(meta?.regularMarketPrice ?? closes[closes.length - 1])
  const previousClose = Number(meta?.previousClose ?? closes[closes.length - 2] ?? currentPrice)
  const reportedChange = Number(meta?.regularMarketChangePercent)
  const change = Number.isFinite(reportedChange) ? reportedChange : previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0
  
  const ema9 = calculateEMA(closes, 9)
  const ema20 = calculateEMA(closes, 20)
  const ema50 = calculateEMA(closes, 50)
  const ema200 = calculateEMA(closes, 200)
  const rsi = calculateRSI(closes, 14)
  const { macd, signal, histogram } = calculateMACD(closes)
  const vwap = calculateVWAP(highs, lows, closes, volumes)
  const { adx } = calculateADX(highs, lows, closes, 14)
  const atr = calculateATR(highs, lows, closes, 14)
  const { support, resistance, pivot } = calculateSuportResistance(highs, lows, closes)
  const volAnalysis = calculateVolumAnalysis(volumes, closes)
  const structure = calculateMarketStructure(highs, lows, closes)
  const detectedPattern = detectChartPattern(highs, lows, closes, volumes)
  const pattern = detectedPattern || {
    type: 'Consolidation',
    direction: 'Neutral',
    confidence: 0.5,
    breakoutLevel: currentPrice
  }
  
  const latestRsi = Number(rsi[rsi.length - 1] ?? 50)
  const latestMacd = Number(macd[macd.length - 1] ?? 0)
  const latestSignal = Number(signal[signal.length - 1] ?? 0)
  const latestMacdHistogram = Number(histogram[histogram.length - 1] ?? 0)
  const latestVwap = Number(vwap[vwap.length - 1] ?? currentPrice)
  const latestAdx = Number(adx[adx.length - 1] ?? 0)
  const latestEma9 = Number(ema9[ema9.length - 1] ?? currentPrice)
  const latestEma20 = Number(ema20[ema20.length - 1] ?? currentPrice)
  const latestEma50 = Number(ema50[ema50.length - 1] ?? currentPrice)
  const latestEma200 = Number(ema200[ema200.length - 1] ?? currentPrice)
  const liveRsiValues = intradayData ? calculateRSI(intradayData.closes, 14) : []
  const liveMacdValues = intradayData ? calculateMACD(intradayData.closes) : { macd: [], signal: [] }
  const liveVwapValues = intradayData ? calculateVWAP(intradayData.highs, intradayData.lows, intradayData.closes, intradayData.volumes) : []
  const liveRsi = Number(liveRsiValues.at(-1) ?? latestRsi)
  const liveMacd = Number(liveMacdValues.macd.at(-1) ?? latestMacd)
  const liveSignal = Number(liveMacdValues.signal.at(-1) ?? latestSignal)
  const liveVwap = Number(liveVwapValues.at(-1) ?? latestVwap)
  const dma20 = calculateSMA(closes, 20).at(-1) ?? currentPrice
  const dma50 = calculateSMA(closes, 50).at(-1) ?? currentPrice
  const dma200 = calculateSMA(closes, 200).at(-1) ?? currentPrice
  const previous20High = Math.max(...closes.slice(-21, -1))
  const breakoutIndex = closes.reduce((latestIndex, close, index) => {
    if (index < 20) return latestIndex
    const priorHigh = Math.max(...highs.slice(index - 20, index))
    return close > priorHigh ? index : latestIndex
  }, -1)
  const breakdownIndex = closes.reduce((latestIndex, close, index) => {
    if (index < 20) return latestIndex
    const priorLow = Math.min(...lows.slice(index - 20, index))
    return close < priorLow ? index : latestIndex
  }, -1)
  const previous20Volumes = volumes.slice(-21, -1)
  const averageVolume20 = previous20Volumes.reduce((total, volume) => total + volume, 0) / Math.min(20, previous20Volumes.length)
  const currentVolume = volumes[volumes.length - 1]
  const averageTradedValue = closes.slice(-20).reduce((total, close, index) => total + close * volumes.slice(-20)[index], 0) / Math.min(20, closes.slice(-20).length)

  const intradayBias = currentPrice > liveVwap && liveRsi > 55 && liveRsi < 70 && liveMacd > liveSignal ? 'Bullish' :
    currentPrice < liveVwap && liveRsi < 45 ? 'Bearish' : 'Neutral'

  const swingBias = latestEma20 > latestEma50 && latestEma50 > latestEma200 && latestAdx > 25 ? 'Bullish' :
    latestEma20 < latestEma50 && latestEma50 < latestEma200 ? 'Bearish' : 'Neutral'

  const latestAtr = Number(atr.at(-1) ?? currentPrice * 0.015)
  const liveHighs = intradayData?.highs?.filter(value => Number.isFinite(Number(value)) && Number(value) > 0) || []
  const liveLows = intradayData?.lows?.filter(value => Number.isFinite(Number(value)) && Number(value) > 0) || []
  const liveHigh = liveHighs.length ? Math.max(...liveHighs) : resistance
  const liveLow = liveLows.length ? Math.min(...liveLows) : support
  const liveAtrValues = intradayData ? calculateATR(intradayData.highs, intradayData.lows, intradayData.closes, 14) : []
  const intradayAtr = Number(liveAtrValues.at(-1) ?? latestAtr)
  const intradayLevels = calculateRiskLevels({ currentPrice, support: liveLow, resistance: liveHigh, atr: intradayAtr, bias: intradayBias })
  const swingLevels = calculateRiskLevels({ currentPrice, support, resistance, atr: latestAtr * 1.5, bias: swingBias })
  const intradayStopLoss = intradayLevels.stopLoss
  const intradayTarget = intradayLevels.target
  const swingStopLoss = swingLevels.stopLoss
  const swingTarget = swingLevels.target
  const intradayProfitZone = Math.max(currentPrice, intradayTarget)
  const swingProfitZone = Math.max(currentPrice, swingTarget)

  const analysisData = {
    ...stock,
    sector: resolveSector(stock),
    currentPrice,
    previousClose,
    change,
    ema9: latestEma9,
    ema20: latestEma20,
    ema50: latestEma50,
    ema200: latestEma200,
    dma20,
    dma50,
    dma200,
    rsi: latestRsi,
    macd: latestMacd,
    signal: latestSignal,
    macdHistogram: latestMacdHistogram,
    vwap: latestVwap,
    adx: latestAdx,
    atr: latestAtr,
    intradayAtr,
    intradaySessionHigh: liveHigh,
    intradaySessionLow: liveLow,
    intradayVwap: liveVwap,
    intradayRsi: liveRsi,
    support,
    resistance,
    pivot,
    volumeAnalysis: volAnalysis,
    pattern,
    marketStructure: structure,
    dividends,
    high52: Math.max(...closes),
    low52: Math.min(...closes),
    marketCap: Number(meta?.marketCap || 0),
    previous20High,
    averageVolume20,
    currentVolume,
    averageTradedValue,
    riskReward: 2,
    intradayBias,
    swingBias,
    latestMarketDate: data.timestamps.at(-1) ? new Date(data.timestamps.at(-1) * 1000).toISOString() : new Date().toISOString(),
    breakoutDate: breakoutIndex >= 0 ? new Date(data.timestamps[breakoutIndex] * 1000).toISOString() : null,
    breakdownDate: breakdownIndex >= 0 ? new Date(data.timestamps[breakdownIndex] * 1000).toISOString() : null,
    intradayProfitZone,
    swingProfitZone,
    intradayTarget,
    intradayStopLoss,
    swingTarget,
    swingStopLoss,
    intradayRiskDirection: intradayLevels.direction,
    swingRiskDirection: swingLevels.direction
  }
  
  const technicalScreenerPass = Object.entries(getScreenerCheck(analysisData)).filter(([key]) => key !== 'marketCap').every(([, passes]) => passes)
  let financials = null
  if (technicalScreenerPass) {
    financials = await fetchFinancials(stock.symbol)
    analysisData.marketCap = Number(financials?.valuation?.marketCap || 0)
  }

  const scored = scoreSetup(analysisData)
  analysisData.technicalScore = scored.technicalScore
  analysisData.dvm = calculateDvmScore({ ...analysisData, financials })
  analysisData.profitProbability = calculateProfitProbability(analysisData)
  
  return analysisData
}

function StockAnalysisDashboard() {
  const [stocks, setStocks] = useState([])
  const [stockDirectory, setStockDirectory] = useState(STOCK_CONFIG)
  const [trackedStocks, setTrackedStocks] = useState(() => {
    try {
      const savedStocks = JSON.parse(localStorage.getItem('stock-pulse-tracked-stocks') || 'null')
      return Array.isArray(savedStocks) && savedStocks.length ? dedupeBySymbol(savedStocks) : STOCK_CONFIG
    } catch {
      return STOCK_CONFIG
    }
  })
  const [loading, setLoading] = useState(true)
    const [analysisProgress, setAnalysisProgress] = useState({ completed: 0, total: 0 })
  const [selectedStock, setSelectedStock] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [nseDividends, setNseDividends] = useState([])
  const [dividendLoading, setDividendLoading] = useState(false)
  const [dividendError, setDividendError] = useState('')
  const [ipos, setIpos] = useState([])
  const [ipoLoading, setIpoLoading] = useState(false)
  const [ipoError, setIpoError] = useState('')
  const [selectedIpo, setSelectedIpo] = useState(null)
  const [newsArticles, setNewsArticles] = useState([])
  const [newsLoading, setNewsLoading] = useState(false)
  const [newsError, setNewsError] = useState('')
  const [marketAlerts, setMarketAlerts] = useState([])
  const [alertsLoading, setAlertsLoading] = useState(false)
  const [alertsError, setAlertsError] = useState('')
  const [watchlistSymbols, setWatchlistSymbols] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('stock-pulse-watchlist') || '[]')
    } catch {
      return []
    }
  })
  const [tab, setTab] = useState('top30')
  const [tabSearches, setTabSearches] = useState({})
  const [menu, setMenu] = useState(false)
  const [showStockList, setShowStockList] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: 'change', direction: 'desc' })
  const [stockPage, setStockPage] = useState(1)
  const [stockUniverseReady, setStockUniverseReady] = useState(false)
  const trackedUniverse = useMemo(() => dedupeBySymbol([...trackedStocks, ...STOCK_CONFIG]).slice(0, MAX_ANALYSIS_STOCKS), [trackedStocks])

  const saveTrackedStocks = (updater) => {
    setTrackedStocks(current => {
      const next = dedupeBySymbol(typeof updater === 'function' ? updater(current) : updater)
      localStorage.setItem('stock-pulse-tracked-stocks', JSON.stringify(next))
      return next
    })
  }

  const loadAnalysis = async (stockList = trackedStocks) => {
    setLoading(true)
    const universe = dedupeBySymbol([...stockList, ...STOCK_CONFIG]).slice(0, MAX_ANALYSIS_STOCKS)
    setAnalysisProgress({ completed: 0, total: universe.length })
    try {
      const allResults = []
      let nextIndex = 0
      let completedCount = 0
      const publishProgress = () => {
        const sorted = [...allResults].sort((a, b) => (b.technicalScore || 0) - (a.technicalScore || 0))
        if (sorted.length > 0) setStocks(sorted)
        setAnalysisProgress({ completed: completedCount, total: universe.length })
      }

      const analyzeWorker = async () => {
        while (nextIndex < universe.length) {
          const index = nextIndex
          nextIndex += 1
          try {
            const result = await analyzeStock(universe[index])
            if (result) allResults.push(result)
          } catch (error) {
            console.warn(`Analysis failed for ${universe[index].symbol}:`, error)
          } finally {
            completedCount += 1
            if (completedCount % 20 === 0 || completedCount === universe.length) publishProgress()
          }
        }
      }

      const workers = Array.from({ length: Math.min(ANALYSIS_CONCURRENCY, universe.length) }, () => analyzeWorker())
      await Promise.all(workers)
      publishProgress()
    } catch (error) {
      console.error('Error loading analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStockSearch = async (event) => {
    event.preventDefault()
    const input = searchQuery.trim().toUpperCase()
    if (!input) return

    const directoryMatch = stockDirectory.find(stock => `${stock.s} ${stock.n} ${stock.symbol}`.toLowerCase() === searchQuery.trim().toLowerCase())
    const exchange = directoryMatch?.symbol.endsWith('.BO') || input.startsWith('BSE:') || input.endsWith('.BO') ? 'BSE' : 'NSE'
    const rawSymbol = directoryMatch ? directoryMatch.symbol.replace(/\.(NS|BO)$/, '') : input.replace(/^(NSE|BSE):/, '').replace(/\.(NS|BO)$/, '')
    if (!/^[A-Z0-9&-]+$/.test(rawSymbol)) {
      setSearchError('Enter a valid NSE/BSE symbol, such as RELIANCE or BSE:TCS.')
      return
    }

    const symbol = `${rawSymbol}.${exchange === 'BSE' ? 'BO' : 'NS'}`
    const knownStock = directoryMatch || trackedStocks.find(stock => stock.symbol === symbol) || STOCK_CONFIG.find(stock => stock.symbol === symbol)
    const stock = knownStock || {
      s: rawSymbol,
      n: rawSymbol,
      symbol,
      c: 'Searched Stock',
      sector: resolveSector({ s: rawSymbol, n: rawSymbol, symbol })
    }

    setSearching(true)
    setSearchError('')
    const result = await analyzeStock(stock)
    setSearching(false)

    if (!result) {
      setSearchError(`No market data found for ${exchange}:${rawSymbol}. Check the symbol and exchange.`)
      return
    }

    saveTrackedStocks(current => current.some(stockItem => stockItem.symbol === result.symbol) ? current : [...current, stock])
    setStocks(current => [result, ...current.filter(stockItem => stockItem.symbol !== result.symbol)])
    setSelectedStock(result)
  }

  const removeTrackedStock = (symbol) => {
    saveTrackedStocks(current => current.filter(stock => stock.symbol !== symbol))
    setStocks(current => current.filter(stock => stock.symbol !== symbol))
    setWatchlistSymbols(current => {
      const next = current.filter(watchedSymbol => watchedSymbol !== symbol)
      localStorage.setItem('stock-pulse-watchlist', JSON.stringify(next))
      return next
    })
    setSelectedStock(current => current?.symbol === symbol ? null : current)
  }
  
  useEffect(() => {
    let cancelled = false
    const loadStockUniverse = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
        const response = await fetch(`${apiBaseUrl}/stocks`)
        if (!response.ok) throw new Error(`Stock universe returned ${response.status}`)
        const data = await response.json()
        const remoteStocks = Array.isArray(data.stocks) ? data.stocks : []
        if (!cancelled && remoteStocks.length) {
          setStockDirectory(dedupeBySymbol([...STOCK_CONFIG, ...remoteStocks]))
          const categories = ['Large Cap', 'Mid Cap', 'Small Cap']
          const categorizedRemoteStocks = remoteStocks.map((stock, index) => {
            const configuredStock = STOCK_CONFIG.find(item => item.symbol === stock.symbol)
            return configuredStock ? { ...stock, c: configuredStock.c, sector: configuredStock.sector } : { ...stock, c: categories[index % categories.length] }
          })
          const next = dedupeBySymbol([...STOCK_CONFIG, ...categorizedRemoteStocks]).slice(0, MAX_ANALYSIS_STOCKS)
          setTrackedStocks(current => {
            const merged = dedupeBySymbol([...next, ...current]).slice(0, MAX_ANALYSIS_STOCKS)
            localStorage.setItem('stock-pulse-tracked-stocks', JSON.stringify(merged))
            return merged
          })
          setStockUniverseReady(true)
          return
        }
      } catch (error) {
        console.warn('Failed to fetch NSE stock universe; using configured stocks:', error)
      }
      if (!cancelled) setStockUniverseReady(true)
    }
    loadStockUniverse()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!stockUniverseReady) return undefined
    loadAnalysis()
    const interval = setInterval(loadAnalysis, 1800000) // 30 minutes
    return () => clearInterval(interval)
  }, [trackedStocks, stockUniverseReady])

  useEffect(() => {
    const loadNews = async () => {
      setNewsLoading(true)
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
        const response = await fetch(`${apiBaseUrl}/news`)
        if (!response.ok) throw new Error(`Market news feed returned ${response.status}`)
        const data = await response.json()
        setNewsArticles(data.articles || [])
        setNewsError('')
      } catch (error) {
        console.warn('Failed to fetch market news:', error)
        setNewsError("News feed is temporarily unavailable. Showing today's market movers instead.")
      } finally {
        setNewsLoading(false)
      }
    }

    loadNews()
    const interval = setInterval(loadNews, 1800000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const loadNseDividends = async () => {
      setDividendLoading(true)
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
        const response = await fetch(`${apiBaseUrl}/dividends`)
        if (!response.ok) throw new Error(`NSE dividend feed returned ${response.status}`)
        const data = await response.json()
        setNseDividends(data.dividends || [])
        setDividendError('')
      } catch (error) {
        console.warn('Failed to fetch NSE dividends:', error)
        setDividendError('NSE dividend data is temporarily unavailable.')
      } finally {
        setDividendLoading(false)
      }
    }

    loadNseDividends()
    const interval = setInterval(loadNseDividends, 1800000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const loadAlerts = async () => {
      setAlertsLoading(true)
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
        const response = await fetch(`${apiBaseUrl}/alerts`)
        if (!response.ok) throw new Error(`Alert feed returned ${response.status}`)
        const data = await response.json()
        setMarketAlerts(data.alerts || [])
        setAlertsError('')
      } catch (error) {
        console.warn('Failed to fetch market alerts:', error)
        setAlertsError('NSE and market alerts are temporarily unavailable.')
      } finally {
        setAlertsLoading(false)
      }
    }
    loadAlerts()
    const interval = setInterval(loadAlerts, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const loadIpos = async () => {
      setIpoLoading(true)
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
        const response = await fetch(`${apiBaseUrl}/ipos?window=3`, { cache: 'no-store' })
        if (!response.ok) throw new Error(`NSE IPO feed returned ${response.status}`)
        const data = await response.json()
        setIpos(data.ipos || [])
        setIpoError('')
      } catch (error) {
        console.warn('Failed to fetch NSE IPOs:', error)
        setIpoError('NSE IPO data is temporarily unavailable.')
      } finally {
        setIpoLoading(false)
      }
    }
    loadIpos()
    const interval = setInterval(loadIpos, 1800000)
    return () => clearInterval(interval)
  }, [])
  
  const sortStocks = (items) => [...items].sort((a, b) => {
    const sortValue = stock => {
      if (sortConfig.key === 'name' || sortConfig.key === 'stock') return stock.n || stock.s
      if (sortConfig.key === 'pattern') return stock.pattern?.type || ''
      if (sortConfig.key === 'trend') return stock.marketStructure?.trend || 'Neutral'
      if (sortConfig.key === 'volume') return stock.volumeAnalysis?.rvol ?? 0
      if (sortConfig.key === 'profitProbability') return calculateProfitProbability(stock, getRelatedNews(stock, newsArticles))
      return stock[sortConfig.key] ?? 0
    }
    const valueA = sortValue(a)
    const valueB = sortValue(b)
    const result = typeof valueA === 'string' ? valueA.localeCompare(valueB) : valueA - valueB
    return sortConfig.direction === 'asc' ? result : -result
  })

  const largeCaps = useMemo(() => sortStocks(stocks.filter(s => s.c === 'Large Cap')), [stocks, sortConfig, newsArticles])
  const midCaps = useMemo(() => sortStocks(stocks.filter(s => s.c === 'Mid Cap')), [stocks, sortConfig, newsArticles])
  const smallCaps = useMemo(() => sortStocks(stocks.filter(s => s.c === 'Small Cap')), [stocks, sortConfig, newsArticles])
  const top50 = useMemo(() => sortStocks(stocks).slice(0, 50), [stocks, sortConfig, newsArticles])
  const sortPatterns = (items) => [...items].sort((first, second) => {
    const confidenceDifference = (second.pattern?.confidence || 0) - (first.pattern?.confidence || 0)
    return confidenceDifference || (second.technicalScore || 0) - (first.technicalScore || 0)
  })
  const bullishPatterns = useMemo(() => sortPatterns(stocks.filter(s => s.pattern?.direction === 'Bullish')), [stocks])
  const bearishPatterns = useMemo(() => sortPatterns(stocks.filter(s => s.pattern?.direction === 'Bearish')), [stocks])
  const watchlistStocks = useMemo(() => sortStocks(stocks.filter(stock => watchlistSymbols.includes(stock.symbol))), [stocks, watchlistSymbols, sortConfig, newsArticles])
  const newsMovers = useMemo(() => {
    const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000
    const weeklyArticles = newsArticles.filter(article => {
      const publishedAt = Date.parse(article.publishedAt || '')
      return Number.isFinite(publishedAt) && publishedAt >= weekStart && publishedAt <= Date.now()
    })
    const ranked = stocks.map(stock => {
    const keywords = [stock.s, stock.n, stock.symbol.replace(/\.(NS|BO)$/, '')].map(value => value.toLowerCase())
    const matches = weeklyArticles.filter(article => keywords.some(keyword => keyword.length > 2 && `${article.title} ${article.description}`.toLowerCase().includes(keyword)))
    return { stock, articles: matches }
    }).filter(item => item.articles.length > 0)
      .sort((first, second) => second.articles.length - first.articles.length || (second.stock.change || 0) - (first.stock.change || 0))
    return ranked.slice(0, 50)
  }, [stocks, newsArticles])
  const brokerCalls = useMemo(() => stocks
    .slice()
    .sort((first, second) => (second.technicalScore || 0) - (first.technicalScore || 0) || (second.change || 0) - (first.change || 0))
    .slice(0, 50)
    .map((stock, index) => {
      const broker = BROKER_PROFILES[index % BROKER_PROFILES.length]
      const score = stock.technicalScore || 0
      const bullish = score >= 60 || (score >= 48 && (stock.change || 0) > 0)
      const bearish = score < 40 && (stock.change || 0) < 0
      const call = bullish ? 'BUY' : bearish ? 'SELL' : 'HOLD'
      const riskDistance = Math.max(stock.currentPrice - stock.swingStopLoss, stock.currentPrice * 0.03)
      const target = bullish
        ? stock.resistance > stock.currentPrice ? stock.resistance : stock.currentPrice + riskDistance * 1.5
        : bearish
          ? stock.support < stock.currentPrice ? stock.support : stock.currentPrice - riskDistance * 1.5
          : stock.currentPrice
      const stopLoss = bullish ? stock.swingStopLoss : bearish ? stock.swingTarget : stock.support
      const normalizedTarget = Number(target || stock.currentPrice || 0)
      const normalizedCurrentPrice = Number(stock.currentPrice || 0)
      const upside = normalizedCurrentPrice ? Number((((normalizedTarget - normalizedCurrentPrice) / normalizedCurrentPrice) * 100).toFixed(1)) : 0
      const recommendation = call === 'BUY' ? 'Buy' : call === 'SELL' ? 'Sell / Reduce' : 'Hold / Wait'
      const signalDate = call === 'BUY' ? stock.breakoutDate : call === 'SELL' ? stock.breakdownDate : stock.latestMarketDate
      return {
        stock,
        broker,
        call,
        target: normalizedTarget,
        stopLoss: Number(stopLoss || stock.currentPrice || 0),
        upside,
        recommendation,
        recommendationDate: signalDate || stock.latestMarketDate,
        confidence: Math.min(95, Math.max(52, Math.round((score * broker.bias) || 52))),
        rationale: call === 'BUY' ? `${stock.pattern?.type || 'Positive trend'} with ${stock.marketStructure?.trend || 'supportive structure'}` : call === 'SELL' ? `Weak momentum with ${stock.marketStructure?.trend || 'downside risk'}` : 'Mixed momentum; wait for confirmation'
      }
    }), [stocks])

  const matchesStockSearch = (stock, query) => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return true
    return [stock.s, stock.n, stock.symbol, stock.sector, stock.c]
      .some(value => String(value || '').toLowerCase().includes(normalizedQuery))
  }
  const filterStocksForTab = (items, tabKey) => items.filter(stock => matchesStockSearch(stock, tabSearches[tabKey] || ''))
  const visibleTop50 = filterStocksForTab(top50, 'top30')
  const visibleLargeCaps = filterStocksForTab(largeCaps, 'largecap')
  const visibleMidCaps = filterStocksForTab(midCaps, 'midcap')
  const visibleSmallCaps = filterStocksForTab(smallCaps, 'smallcap')
  const visibleWatchlist = filterStocksForTab(watchlistStocks, 'watchlist')
  const paginateStocks = items => items.slice((stockPage - 1) * 50, stockPage * 50)
  const pagedTop50 = paginateStocks(visibleTop50)
  const pagedLargeCaps = paginateStocks(visibleLargeCaps)
  const pagedMidCaps = paginateStocks(visibleMidCaps)
  const pagedSmallCaps = paginateStocks(visibleSmallCaps)
  const pagedWatchlist = paginateStocks(visibleWatchlist)
  useEffect(() => {
    setStockPage(1)
  }, [tab, sortConfig, tabSearches])
  const visibleBullishPatterns = filterStocksForTab(bullishPatterns, 'patterns')
  const visibleBearishPatterns = filterStocksForTab(bearishPatterns, 'patterns')
  const visibleNewsMovers = newsMovers.filter(item => matchesStockSearch(item.stock, tabSearches.news || ''))
  const visibleBrokerCalls = brokerCalls.filter(item => matchesStockSearch(item.stock, tabSearches.brokerCalls || ''))
  const visibleDividends = nseDividends.filter(dividend => `${dividend.company} ${dividend.purpose}`.toLowerCase().includes((tabSearches.dividends || '').trim().toLowerCase()))
  const visibleIpos = ipos.filter(ipo => `${ipo.company} ${ipo.symbol} ${ipo.status} ${ipo.issueType}`.toLowerCase().includes((tabSearches.ipos || '').trim().toLowerCase()))
  const searchableTabs = new Set(['top30', 'largecap', 'midcap', 'smallcap', 'watchlist', 'patterns', 'news', 'brokerCalls', 'dividends', 'ipos'])
  const searchSuggestions = searchQuery.trim().length < 2 ? [] : stockDirectory.filter(stock => `${stock.s} ${stock.n} ${stock.symbol}`.toLowerCase().includes(searchQuery.trim().toLowerCase())).slice(0, 8)

  const toggleWatchlist = (stock) => {
    setWatchlistSymbols(current => {
      const next = current.includes(stock.symbol)
        ? current.filter(symbol => symbol !== stock.symbol)
        : [...current, stock.symbol]
      localStorage.setItem('stock-pulse-watchlist', JSON.stringify(next))
      return next
    })
  }

  const handleNavClick = (label) => {
    setTab(label === 'News' ? 'news' : label === 'Patterns' ? 'patterns' : label === 'Dividends' ? 'dividends' : label === 'IPOs' ? 'ipos' : label === 'Watchlist' ? 'watchlist' : label === 'Alerts' ? 'alerts' : 'top30')
    setMenu(false)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo" aria-label="Stock Pulse logo">
            <LineChart size={21} strokeWidth={2.6} aria-hidden="true" />
          </div>
          <div><b>Stock Pulse</b><span>AI ANALYSIS</span></div>
        </div>
        <div className="market-cockpit">
          <div className="cockpit-status"><span className="live-dot" /> LIVE MARKET PULSE</div>
          <div className="cockpit-divider" />
          <div className="cockpit-stat"><strong>{stockUniverseReady ? trackedUniverse.length : '...'}</strong><span>stocks tracked</span></div>
          <div className="cockpit-stat"><strong>AI</strong><span>analysis online</span></div>
          <div className="cockpit-date"><span>INDIA · NSE / BSE</span><strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
        </div>
        <div className="top-actions">
          <button className="iconbtn"><Bell size={18} /></button>
          <button className="profile">AI</button>
          <nav className="topbar-nav" aria-label="Main navigation">
            <select className="broker-menu" aria-label="Select broker" defaultValue="" onChange={event => { const broker = BROKER_PROFILES.find(item => item.name === event.target.value); if (broker) window.open(broker.url, '_blank', 'noopener,noreferrer'); event.target.value = '' }}>
              <option value="">🔗 Brokers</option>
              {BROKER_PROFILES.map(broker => <option value={broker.name} key={broker.name}>{broker.name}</option>)}
            </select>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <div className="eyebrow"><span className="live-dot" /> REAL-TIME TECHNICAL ANALYSIS</div>
            <h1>Indian Stock Market <em>AI Engine</em></h1>
            <p>Advanced technical analysis with chart patterns, indicators, market regime detection, and risk/reward scoring for the top 50 stocks across Large, Mid, and Small Cap categories.</p>
          </div>
          <div className="hero-actions">
            <form className="stock-search" onSubmit={handleStockSearch}>
              <Search size={16} />
              <input
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="Search NSE/BSE name or symbol"
                aria-label="Search NSE or BSE stock name or symbol"
              />
              <button type="submit" disabled={searching}>
                {searching ? 'Analyzing...' : 'Analyze & Add'}
              </button>
              {searchSuggestions.length > 0 && <div className="stock-search-suggestions">{searchSuggestions.map(stock => <button type="button" key={stock.symbol} onClick={() => setSearchQuery(`${stock.symbol.endsWith('.BO') ? 'BSE' : 'NSE'}:${stock.s}`)}><strong>{stock.n}</strong><span>{stock.symbol.endsWith('.BO') ? 'BSE' : 'NSE'}:{stock.s}</span></button>)}</div>}
            </form>
            <button className="refresh" onClick={loadAnalysis} disabled={loading}>
              <RefreshCw className={loading ? 'spin' : ''} size={17} /> {loading ? 'Refreshing...' : 'Refresh Analysis'}
            </button>
            <button className="refresh" onClick={() => setShowStockList(current => !current)}>
              <Layers3 size={17} /> Stocks ({stockUniverseReady ? trackedUniverse.length : '...'})
            </button>
          </div>
        </section>

        {searchError && <div className="search-error" role="alert">{searchError}</div>}
        {showStockList && (
          <section className="card tracked-stock-list">
            <div><h2>Tracked stocks ({stockUniverseReady ? trackedUniverse.length : 'loading...'})</h2><p>Showing the full NSE analysis universe. Analyze a symbol above to add it; your list is saved in this browser.</p></div>
            <div className="tracked-stock-chips">
              {stockUniverseReady ? trackedUniverse.map(stock => <span key={stock.symbol}>{stock.s}<button onClick={() => removeTrackedStock(stock.symbol)} aria-label={`Remove ${stock.s}`}>×</button></span>) : <div className="no-results">Loading 1,000 NSE stocks...</div>}
            </div>
          </section>
        )}

        <section className="tabs-nav">
          <button className={tab === 'top30' ? 'active' : ''} onClick={() => setTab('top30')}>
            🏆 Top 50 Opportunities
          </button>
          <button className={tab === 'largecap' ? 'active' : ''} onClick={() => setTab('largecap')}>
            🥇 Large Cap ({largeCaps.length})
          </button>
          <button className={tab === 'midcap' ? 'active' : ''} onClick={() => setTab('midcap')}>
            🚀 Mid Cap ({midCaps.length})
          </button>
          <button className={tab === 'smallcap' ? 'active' : ''} onClick={() => setTab('smallcap')}>
            ⚡ Small Cap ({smallCaps.length})
          </button>
          <button className={tab === 'patterns' ? 'active' : ''} onClick={() => setTab('patterns')}>
            📊 Patterns
          </button>
          <button className={tab === 'screener' ? 'active' : ''} onClick={() => setTab('screener')}>
            🔎 Screener ({stocks.filter(matchesScreener).length})
          </button>
          <button className={tab === 'news' ? 'active' : ''} onClick={() => setTab('news')}>
            📰 News Movers
          </button>
          <button className={tab === 'brokerCalls' ? 'active' : ''} onClick={() => setTab('brokerCalls')}>
            🎯 Broker Calls
          </button>
          <button className={tab === 'ai' ? 'active' : ''} onClick={() => setTab('ai')}>
            ✦ AI Q&amp;A
          </button>
          <button className={tab === 'dividends' ? 'active' : ''} onClick={() => setTab('dividends')}>
            💰 Dividends ({nseDividends.length})
          </button>
          <button className={tab === 'ipos' ? 'active' : ''} onClick={() => setTab('ipos')}>
            🚀 IPOs ({ipos.length})
          </button>
          <button className={tab === 'alerts' ? 'active' : ''} onClick={() => setTab('alerts')}>
            🚨 Alerts ({marketAlerts.length})
          </button>
          <button className={tab === 'watchlist' ? 'active' : ''} onClick={() => setTab('watchlist')}>
            ⭐ Watchlist ({watchlistStocks.length})
          </button>
        </section>

        {searchableTabs.has(tab) && (
          <div className="tab-stock-search">
            <Search size={15} />
            <input
              value={tabSearches[tab] || ''}
              onChange={event => setTabSearches(current => ({ ...current, [tab]: event.target.value }))}
              placeholder={tab === 'dividends' ? 'Search company or purpose in this tab' : tab === 'ipos' ? 'Search company, symbol, or IPO status' : 'Search stock, symbol, or sector in this tab'}
              aria-label={`Search stocks in the ${tab} tab`}
            />
            {(tabSearches[tab] || '') && <button onClick={() => setTabSearches(current => ({ ...current, [tab]: '' }))}>Clear</button>}
          </div>
        )}

        {loading && stocks.length === 0 ? (
          <div className="loading">
            <Sparkles className="spin" size={32} />
            <div>
              <p>Analyzing stocks...</p>
              <small>Fetching live market data ({analysisProgress.completed}/{analysisProgress.total}) {stocks.length > 0 && `· ${stocks.length} analyzed`}</small>
            </div>
          </div>
        ) : (
          <>
            {tab === 'top30' && (
              <section className="card analysis-section">
                <h2>🏆 TOP 50 RANKED STOCKS</h2>
                <StockSortControls sortConfig={sortConfig} onChange={setSortConfig} />
                <div className="table-wrapper">
                  <table className="analysis-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Change %</th>
                        <th>Pattern</th>
                        <th>RSI</th>
                        <th>Trend</th>
                        <th>Volume</th>
                        <th>Score</th>
                        <th>Profit probability</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedTop50.map((stock, idx) => (
                        <tr key={stock.s} onClick={() => setSelectedStock(stock)}>
                          <td className="rank">{(stockPage - 1) * 50 + idx + 1}</td>
                          <td className="stock-name">
                            <strong>{stock.s}</strong>
                            <small>{stock.n}</small>
                            <span className={`dvm-badge ${getDvmTone(stock.dvm?.score)}`} title={`Durability: ${stock.dvm?.durability || 0} · Valuation: ${stock.dvm?.valuation || 0} · Momentum: ${stock.dvm?.momentum || 0}`}>
                              DVM {stock.dvm?.score || 0} · {getDvmStatus(stock.dvm)}
                            </span>
                            <div className="stock-tags">
                              <span className="category">{stock.c}</span>
                              <span className="sector">{resolveSector(stock)}</span>
                            </div>
                          </td>
                          <td className="price">₹{stock.currentPrice?.toFixed(2) || 'N/A'}</td>
                          <td className={stock.change >= 0 ? 'positive' : 'negative'}>
                            {stock.change >= 0 ? '+' : ''}{formatChange(stock.change)}%
                          </td>
                          <td className="pattern-cell">
                            {stock.pattern ? (
                              <span className={`pattern-badge ${getPatternClass(stock.pattern)}`}>
                                {stock.pattern.type}
                              </span>
                            ) : 'No Pattern'}
                          </td>
                          <td className="rsi">
                            <span className={stock.rsi > 70 ? 'overbought' : stock.rsi < 30 ? 'oversold' : 'neutral'}>
                              {stock.rsi?.toFixed(1)}
                            </span>
                          </td>
                          <td className="trend">
                            {stock.marketStructure?.trend === 'Uptrend' ? (
                              <TrendingUp size={16} className="up" />
                            ) : stock.marketStructure?.trend === 'Downtrend' ? (
                              <TrendingDown size={16} className="down" />
                            ) : (
                              <Activity size={16} />
                            )}
                          </td>
                          <td className="volume">
                            <span className={`vol-badge ${stock.volumeAnalysis?.trendVolume?.replace(' ', '-').toLowerCase()}`}>
                              {stock.volumeAnalysis?.rvol?.toFixed(2)}x
                            </span>
                          </td>
                          <td className="score">
                            <strong className="score-value">{stock.technicalScore || 0}</strong>
                          </td>
                          <td className="probability-cell"><strong>{calculateProfitProbability(stock, getRelatedNews(stock, newsArticles))}%</strong><small>model estimate</small></td>
                          <td className="row-actions-cell">
                            <button className={`watch-btn ${watchlistSymbols.includes(stock.symbol) ? 'watched' : ''}`} title={watchlistSymbols.includes(stock.symbol) ? 'Remove from watchlist' : 'Add to watchlist'} onClick={event => { event.stopPropagation(); toggleWatchlist(stock) }}>
                              <Star size={14} fill={watchlistSymbols.includes(stock.symbol) ? 'currentColor' : 'none'} />
                            </button>
                            <button className="detail-btn" onClick={() => setSelectedStock(stock)}>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {tab === 'largecap' && (
              <section className="card analysis-section">
                <h2>🥇 {visibleLargeCaps.length} LARGE CAP STOCKS</h2>
                <StockSortControls sortConfig={sortConfig} onChange={setSortConfig} />
                <StockGrid stocks={pagedLargeCaps} newsArticles={newsArticles} onSelect={setSelectedStock} watchlistSymbols={watchlistSymbols} onToggleWatchlist={toggleWatchlist} />
                <StockPagination items={visibleLargeCaps} page={stockPage} onPageChange={setStockPage} />
              </section>
            )}

            {tab === 'midcap' && (
              <section className="card analysis-section">
                <h2>🚀 {visibleMidCaps.length} MID CAP STOCKS</h2>
                <StockSortControls sortConfig={sortConfig} onChange={setSortConfig} />
                <StockGrid stocks={pagedMidCaps} newsArticles={newsArticles} onSelect={setSelectedStock} watchlistSymbols={watchlistSymbols} onToggleWatchlist={toggleWatchlist} />
                <StockPagination items={visibleMidCaps} page={stockPage} onPageChange={setStockPage} />
              </section>
            )}

            {tab === 'smallcap' && (
              <section className="card analysis-section">
                <h2>⚡ {visibleSmallCaps.length} SMALL CAP STOCKS</h2>
                <StockSortControls sortConfig={sortConfig} onChange={setSortConfig} />
                <StockGrid stocks={pagedSmallCaps} newsArticles={newsArticles} onSelect={setSelectedStock} watchlistSymbols={watchlistSymbols} onToggleWatchlist={toggleWatchlist} />
                <StockPagination items={visibleSmallCaps} page={stockPage} onPageChange={setStockPage} />
              </section>
            )}

            {tab === 'watchlist' && (
              <section className="card analysis-section">
                <div className="dividend-heading">
                  <div>
                    <h2>⭐ YOUR WATCHLIST</h2>
                    <p>Stocks saved in this browser profile for further analysis.</p>
                  </div>
                  <span className="dividend-count">{watchlistStocks.length} stocks</span>
                </div>
                <StockSortControls sortConfig={sortConfig} onChange={setSortConfig} />
                {visibleWatchlist.length === 0 ? (
                  <div className="no-results">No stocks saved yet. Use Add to Watchlist on any stock.</div>
                ) : (
                  <>
                    <StockGrid stocks={pagedWatchlist} newsArticles={newsArticles} onSelect={setSelectedStock} watchlistSymbols={watchlistSymbols} onToggleWatchlist={toggleWatchlist} />
                    <StockPagination items={visibleWatchlist} page={stockPage} onPageChange={setStockPage} />
                  </>
                )}
              </section>
            )}

            {tab === 'patterns' && (
              <section className="patterns-section">
                <div className="card">
                  <h2>📈 BULLISH PATTERNS ({visibleBullishPatterns.length})</h2>
                  <PatternGrid patterns={visibleBullishPatterns} onSelect={setSelectedStock} watchlistSymbols={watchlistSymbols} onToggleWatchlist={toggleWatchlist} />
                </div>
                <div className="card">
                  <h2>📉 BEARISH PATTERNS ({visibleBearishPatterns.length})</h2>
                  <PatternGrid patterns={visibleBearishPatterns} onSelect={setSelectedStock} watchlistSymbols={watchlistSymbols} onToggleWatchlist={toggleWatchlist} />
                </div>
              </section>
            )}

            {tab === 'screener' && (
              <StockScreener stocks={stocks.filter(matchesScreener)} onSelect={setSelectedStock} />
            )}

            {tab === 'news' && (
              <NewsMovers movers={visibleNewsMovers} loading={newsLoading} error={newsError} onSelect={setSelectedStock} />
            )}

            {tab === 'brokerCalls' && (
              <BrokerCalls calls={visibleBrokerCalls} onSelect={setSelectedStock} />
            )}

            {tab === 'brokers' && <BrokerDirectory />}

            {tab === 'ai' && (
              <AIQueryPanel stocks={stocks} brokerCalls={brokerCalls} newsMovers={newsMovers} onSelect={setSelectedStock} />
            )}

            {tab === 'dividends' && (
              <DividendCalendar dividends={visibleDividends} loading={dividendLoading} error={dividendError} />
            )}

            {tab === 'ipos' && (
              <IpoCalendar ipos={visibleIpos} newsArticles={newsArticles} loading={ipoLoading} error={ipoError} onSelect={setSelectedIpo} />
            )}

            {tab === 'alerts' && (
              <MarketAlerts alerts={marketAlerts} loading={alertsLoading} error={alertsError} />
            )}

            {selectedStock && <StockDetailPanel stock={selectedStock} newsArticles={newsArticles} onClose={() => setSelectedStock(null)} isWatched={watchlistSymbols.includes(selectedStock.symbol)} onToggleWatchlist={toggleWatchlist} />}
            {selectedIpo && <IpoDetailPanel ipo={selectedIpo} newsArticles={newsArticles} onClose={() => setSelectedIpo(null)} />}
          </>
        )}
      </main>

      <footer>
        <span>Stock Pulse India | AI-Powered Technical Analysis</span>
        <span>Real-time data from public market APIs</span>
        <span>For research purposes only. Always verify before trading.</span>
      </footer>
    </div>
  )
}

function StockGrid({ stocks, newsArticles, onSelect, watchlistSymbols, onToggleWatchlist }) {
  return (
    <div className="stock-grid">
      {stocks.map((stock, idx) => (
        <div key={stock.s} className="stock-card" onClick={() => onSelect(stock)}>
          <div className="rank-badge">#{idx + 1}</div>
          <button className={`card-watch-btn ${watchlistSymbols.includes(stock.symbol) ? 'watched' : ''}`} title={watchlistSymbols.includes(stock.symbol) ? 'Remove from watchlist' : 'Add to watchlist'} onClick={event => { event.stopPropagation(); onToggleWatchlist(stock) }}>
            <Star size={16} fill={watchlistSymbols.includes(stock.symbol) ? 'currentColor' : 'none'} />
          </button>
          <div className="stock-header">
            <div>
              <h3>{stock.s}</h3>
              <p>{stock.n}</p>
              <span className={`dvm-badge ${getDvmTone(stock.dvm?.score)}`}>DVM {stock.dvm?.score || 0}</span>
              <span className="card-sector">{resolveSector(stock)} sector</span>
            </div>
            <span className={`direction ${stock.change >= 0 ? 'bull' : 'bear'}`}>
              {stock.change >= 0 ? '↑' : '↓'} {stock.change >= 0 ? '+' : ''}{formatChange(stock.change)}%
            </span>
          </div>
          <div className="price-display">
            ₹{stock.currentPrice?.toFixed(2) || 'N/A'}
          </div>
          <div className="indicators">
            <div className="indicator">
              <label>RSI</label>
              <strong>{stock.rsi?.toFixed(1)}</strong>
            </div>
            <div className="indicator">
              <label>Volume</label>
              <strong>{stock.volumeAnalysis?.rvol?.toFixed(2)}x</strong>
            </div>
            <div className="indicator">
              <label>Score</label>
              <strong className="score-badge">{stock.technicalScore || 0}/100</strong>
            </div>
            <div className="indicator probability-indicator">
              <label>Profit probability</label>
              <strong>{calculateProfitProbability(stock, getRelatedNews(stock, newsArticles))}%</strong>
            </div>
          </div>
          <div className="indicators compact">
            <div className="indicator">
              <label>Intraday</label>
              <strong>{stock.intradayBias || 'Neutral'}</strong>
            </div>
            <div className="indicator">
              <label>Swing</label>
              <strong>{stock.swingBias || 'Neutral'}</strong>
            </div>
          </div>
          <div className="indicators compact">
            <div className="indicator">
              <label>Target</label>
              <strong>₹{stock.intradayTarget?.toFixed(2) || 'N/A'}</strong>
            </div>
            <div className="indicator">
              <label>SL</label>
              <strong>₹{stock.intradayStopLoss?.toFixed(2) || 'N/A'}</strong>
            </div>
          </div>
          {stock.pattern && (
            <div className={`pattern-info ${stock.pattern.direction.toLowerCase()}`}>
              <Sparkles size={14} /> {stock.pattern.type}
            </div>
          )}
          <button className="view-btn">View Details</button>
        </div>
      ))}
    </div>
  )
}

function StockSortControls({ sortConfig, onChange }) {
  const sortOptions = [
    { value: 'stock', label: 'Stock' },
    { value: 'currentPrice', label: 'Price' },
    { value: 'change', label: 'Daily Change' },
    { value: 'pattern', label: 'Pattern' },
    { value: 'rsi', label: 'RSI' },
    { value: 'trend', label: 'Trend' },
    { value: 'volume', label: 'Volume' },
    { value: 'technicalScore', label: 'Score' },
    { value: 'profitProbability', label: 'Profit Probability' }
  ]

  return (
    <div className="stock-sort-controls">
      <span>Sort stocks by</span>
      <select value={sortConfig.key} onChange={event => onChange({ key: event.target.value, direction: 'asc' })} aria-label="Sort stocks by">
        {sortOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <button onClick={() => onChange({ ...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
        {sortConfig.direction === 'asc' ? '↑ Ascending' : '↓ Descending'}
      </button>
    </div>
  )
}

function StockPagination({ items, page, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(items.length / 50))
  if (totalPages <= 1) return null

  return (
    <div className="stock-pagination" aria-label="Stock pagination">
      <button onClick={() => onPageChange(current => Math.max(1, current - 1))} disabled={page === 1}>Previous</button>
      <span>Page {page} of {totalPages} · Showing {Math.min((page - 1) * 50 + 1, items.length)}-{Math.min(page * 50, items.length)} of {items.length}</span>
      <button onClick={() => onPageChange(current => Math.min(totalPages, current + 1))} disabled={page === totalPages}>Next</button>
    </div>
  )
}

function DividendCalendar({ dividends, loading, error }) {
  const [sortConfig, setSortConfig] = useState({ key: 'exDate', direction: 'asc' })

  const sortedDividends = useMemo(() => {
    const valueFor = (dividend, key) => {
      if (key === 'exDate' || key === 'recordDate' || key === 'publishedAt') {
        const parsed = Date.parse(dividend[key] || '')
        return Number.isNaN(parsed) ? 0 : parsed
      }
      return String(dividend[key] || '').toLowerCase()
    }

    return [...dividends].sort((a, b) => {
      const first = valueFor(a, sortConfig.key)
      const second = valueFor(b, sortConfig.key)
      if (first === second) return 0
      const result = first > second ? 1 : -1
      return sortConfig.direction === 'asc' ? result : -result
    })
  }, [dividends, sortConfig])

  const requestSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const sortIndicator = (key) => sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'

  return (
    <section className="card analysis-section dividend-section">
      <div className="dividend-heading">
        <div>
          <h2>💰 DIVIDEND CALENDAR</h2>
          <p>Live dividend announcements published by NSE corporate actions.</p>
        </div>
        <span className="dividend-count">NSE · {dividends.length} records</span>
      </div>
      {loading ? (
        <div className="no-results">Loading the latest dividend announcements from NSE...</div>
      ) : error ? (
        <div className="no-results">{error}</div>
      ) : dividends.length === 0 ? (
        <div className="no-results">NSE has not published dividend announcements in the current feed.</div>
      ) : (
        <div className="table-wrapper">
          <table className="analysis-table dividend-table">
            <thead>
              <tr>
                <th><button className="sort-header" onClick={() => requestSort('company')}>Company <span>{sortIndicator('company')}</span></button></th>
                <th><button className="sort-header" onClick={() => requestSort('purpose')}>Purpose <span>{sortIndicator('purpose')}</span></button></th>
                <th><button className="sort-header" onClick={() => requestSort('exDate')}>Ex-Date <span>{sortIndicator('exDate')}</span></button></th>
                <th><button className="sort-header" onClick={() => requestSort('recordDate')}>Record Date <span>{sortIndicator('recordDate')}</span></button></th>
                <th><button className="sort-header" onClick={() => requestSort('faceValue')}>Face Value <span>{sortIndicator('faceValue')}</span></button></th>
                <th><button className="sort-header" onClick={() => requestSort('publishedAt')}>Published <span>{sortIndicator('publishedAt')}</span></button></th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {sortedDividends.map((dividend, index) => (
                <tr key={`${dividend.company}-${dividend.exDate}-${index}`}>
                  <td className="stock-name">
                    <strong>{dividend.company}</strong>
                    <small>NSE Equity</small>
                  </td>
                  <td>{dividend.purpose}</td>
                  <td className="dividend-date">{dividend.exDate || '—'}</td>
                  <td>{dividend.recordDate || '—'}</td>
                  <td>{dividend.faceValue || '—'}</td>
                  <td>{dividend.publishedAt ? new Date(dividend.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td><span className="sector">NSE</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function IpoCalendar({ ipos, newsArticles, loading, error, onSelect }) {
  const [statusFilter, setStatusFilter] = useState('All')
  const filters = ['All', 'Upcoming', 'Open', 'Closed', 'Listed']
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  const monthlyIpos = ipos.filter(ipo => [ipo.openDate, ipo.closeDate, ipo.listingDate].some(date => date && new Date(date) >= threeMonthsAgo))
  const filteredIpos = statusFilter === 'All' ? monthlyIpos : monthlyIpos.filter(ipo => ipo.status === statusFilter)

  return (
    <section className="card analysis-section ipo-section">
      <div className="dividend-heading">
        <div>
          <h2>🚀 IPOs</h2>
          <p>IPO issues from the last three months, based on NSE data. Click an IPO for full details.</p>
        </div>
        <span className="dividend-count">NSE · {monthlyIpos.length} in 3 months</span>
      </div>
      <div className="ipo-filters" role="group" aria-label="Filter IPOs by status">
        {filters.map(filter => <button key={filter} className={statusFilter === filter ? 'active' : ''} onClick={() => setStatusFilter(filter)}>{filter} <span>{filter === 'All' ? monthlyIpos.length : monthlyIpos.filter(ipo => ipo.status === filter).length}</span></button>)}
      </div>
      {loading ? (
        <div className="no-results">Loading the latest IPO information from NSE...</div>
      ) : error ? (
        <div className="no-results">{error}</div>
      ) : monthlyIpos.length === 0 ? (
        <div className="no-results">No IPO records are available for the last three months in the NSE feed.</div>
      ) : filteredIpos.length === 0 ? (
        <div className="no-results">No {statusFilter.toLowerCase()} IPOs are available for this month.</div>
      ) : (
        <div className="table-wrapper">
          <table className="analysis-table ipo-table">
            <thead><tr><th>Company</th><th>Type</th><th>Open Date</th><th>Close Date</th><th>Price Band</th><th>Potential Listing</th><th>Current Price</th><th>News Signal</th></tr></thead>
            <tbody>{filteredIpos.map((ipo, index) => (
              <tr key={`${ipo.company}-${ipo.openDate}-${index}`} onClick={() => onSelect(ipo)}>
                <td className="stock-name"><strong>{ipo.company}</strong><small>{ipo.symbol || 'NSE issue'}</small></td>
                <td>{ipo.issueType}</td>
                <td className="dividend-date">{ipo.openDate || '—'}</td>
                <td>{ipo.closeDate || '—'}</td>
                <td>{ipo.priceRange}</td>
                <td className="ipo-estimate">{getIpoListingEstimate(ipo, newsArticles).estimate}</td>
                <td className="ipo-current-price">{ipo.currentPrice || 'Not available'}</td>
                <td><span className="sector">{getIpoListingEstimate(ipo, newsArticles).sentiment}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function IpoDetailPanel({ ipo, newsArticles, onClose }) {
  const listingEstimate = getIpoListingEstimate(ipo, newsArticles)
  const details = [
    ['Issue type', ipo.issueType],
    ['Open date', ipo.openDate],
    ['Close date', ipo.closeDate],
    ['Listing date', ipo.listingDate],
    ['Current price', ipo.currentPrice || 'Not available'],
    ['Price band', ipo.priceRange],
    ['Issue size', ipo.issueSize],
    ['Lot size', ipo.lotSize],
    ['Subscription', ipo.subscription]
  ]

  return (
    <aside className="detail-panel ipo-detail-panel" role="dialog" aria-modal="true" aria-labelledby="ipo-detail-title">
      <div className="panel-header">
        <div><h2 id="ipo-detail-title">{ipo.company}</h2><p>{ipo.symbol || 'New public issue'} · {ipo.status}</p></div>
        <button className="close-btn" onClick={onClose} aria-label="Close IPO details">×</button>
      </div>
      <div className="panel-content">
        <div className="ipo-detail-status"><span className="sector">{ipo.status}</span><strong>{listingEstimate.estimate}</strong><small>Potential listing price</small></div>
        <div className="ipo-detail-grid">{details.map(([label, value]) => <div className="indicator-box" key={label}><label>{label}</label><strong>{value || 'Not disclosed'}</strong></div>)}</div>
        <div className="ipo-news-signal"><strong>{listingEstimate.sentiment}</strong><span>{listingEstimate.newsCount} matched news article{listingEstimate.newsCount === 1 ? '' : 's'} · {listingEstimate.confidence}% confidence</span></div>
        <p className="ipo-disclaimer">Potential listing price is a model estimate using the price-band midpoint and matched news sentiment. It is not a prediction or investment advice.</p>
        <div className="external-links"><a href={ipo.sourceUrl} target="_blank" rel="noreferrer">View on {ipo.source || 'source'} <ExternalLink size={14} /></a></div>
      </div>
    </aside>
  )
}

function AIQueryPanel({ stocks, brokerCalls, newsMovers, onSelect }) {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Ask me about today\'s gainers, a stock\'s trend, RSI, broker calls, news movers, or technical levels.' }
  ])

  const answerQuery = (rawQuery) => {
    const normalized = rawQuery.toLowerCase()
    const stock = stocks.find(item => normalized.includes(item.s.toLowerCase()) || normalized.includes(item.n.toLowerCase()))

    if (!stocks.length) return { text: 'Market analysis is still loading. Please try again in a moment.' }

    if (/top|gainer|gains|ris(e|ing)|strongest|best/.test(normalized)) {
      const gainers = stocks.filter(item => item.change > 0).sort((first, second) => second.change - first.change).slice(0, 5)
      return { text: `Today's strongest positive movers are ${gainers.map(item => `${item.s} (+${item.change.toFixed(2)}%)`).join(', ')}.`, stocks: gainers }
    }

    if (/buy|bullish|recommend|calls?/.test(normalized)) {
      const buys = brokerCalls.filter(item => item.call === 'BUY').slice(0, 5)
      return { text: `The strongest model BUY calls are ${buys.map(item => `${item.stock.s} (target ₹${item.target.toFixed(2)})`).join(', ')}. These are technical signals, not financial advice.`, stocks: buys.map(item => item.stock) }
    }

    if (/news|headline|mover/.test(normalized)) {
      const movers = newsMovers.filter(item => item.articles.length > 0).slice(0, 5)
      return { text: movers.length ? `The most relevant stocks mentioned in this week's news are ${movers.map(item => `${item.stock.s} (${item.articles.length} headline match${item.articles.length === 1 ? '' : 'es'})`).join(', ')}.` : 'No tracked stocks have a direct match in this week\'s news yet.', stocks: movers.map(item => item.stock) }
    }

    if (stock) {
      const call = brokerCalls.find(item => item.stock.symbol === stock.symbol)
      return {
        text: `${stock.s} is at ₹${stock.currentPrice?.toFixed(2)} and is ${stock.change >= 0 ? `up ${stock.change.toFixed(2)}%` : `down ${Math.abs(stock.change).toFixed(2)}%`} today. Trend: ${stock.marketStructure?.trend || ' unavailable'}. RSI: ${stock.rsi?.toFixed(1) || 'N/A'}. Technical score: ${stock.technicalScore || 'N/A'}.${call ? ` Current model call: ${call.call}, target ₹${call.target.toFixed(2)}, stop-loss ₹${call.stopLoss.toFixed(2)}.` : ''}`,
        stocks: [stock]
      }
    }

    if (/rsi|oversold|overbought/.test(normalized)) {
      const rsiStocks = stocks.filter(item => item.rsi < 30 || item.rsi > 70).sort((first, second) => Math.abs(second.rsi - 50) - Math.abs(first.rsi - 50)).slice(0, 5)
      return { text: rsiStocks.length ? `The most extreme RSI readings are ${rsiStocks.map(item => `${item.s} (${item.rsi.toFixed(1)})`).join(', ')}.` : 'No stocks are currently in an extreme RSI zone.', stocks: rsiStocks }
    }

    return { text: 'I can answer questions about a stock, today\'s top gainers, BUY calls, RSI, news movers, trends, targets, and stop-loss levels. Try: “What is the view on RELIANCE?”' }
  }

  const submitQuery = event => {
    event.preventDefault()
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return
    const answer = answerQuery(trimmedQuery)
    setMessages(current => [...current, { role: 'user', text: trimmedQuery }, { role: 'assistant', ...answer }])
    setQuery('')
  }

  return (
    <section className="card ai-panel">
      <div className="ai-panel-header">
        <div className="ai-orb"><Bot size={24} /></div>
        <div><h2>AI Market Q&amp;A</h2><p>Ask questions using the latest analysis loaded in this dashboard.</p></div>
        <span className="ai-live">LIVE DATA</span>
      </div>
      <div className="ai-suggestions">
        {['Top gainers today', 'What is the view on RELIANCE?', 'Show BUY calls', 'Which stocks are overbought?'].map(suggestion => (
          <button key={suggestion} onClick={() => setQuery(suggestion)}>{suggestion}</button>
        ))}
      </div>
      <div className="ai-conversation" aria-live="polite">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`ai-message ${message.role}`}>
            <span className="ai-message-icon">{message.role === 'assistant' ? <Bot size={15} /> : 'You'}</span>
            <div><p>{message.text}</p>{message.stocks?.length > 0 && <div className="ai-stock-links">{message.stocks.map(item => <button key={item.symbol} onClick={() => onSelect(item)}>{item.s} <span>{item.change >= 0 ? '+' : ''}{item.change?.toFixed(2)}%</span></button>)}</div>}</div>
          </div>
        ))}
      </div>
      <form className="ai-query-form" onSubmit={submitQuery}>
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Ask about a stock or the market..." aria-label="Ask the AI market assistant" />
        <button type="submit" aria-label="Send question"><Send size={17} /></button>
      </form>
      <small className="ai-disclaimer">Answers use the app's live technical dataset and are for research only, not financial advice.</small>
    </section>
  )
}

function BrokerCalls({ calls, onSelect }) {
  const [sortConfig, setSortConfig] = useState({ key: 'confidence', direction: 'desc' })
  const sortedCalls = useMemo(() => [...calls].sort((first, second) => {
    const valueFor = item => {
      if (sortConfig.key === 'stock') return item.stock.n || item.stock.s
      if (sortConfig.key === 'call') return item.call
      if (sortConfig.key === 'date') return Date.parse(item.recommendationDate || '') || 0
      return Number(item[sortConfig.key] || 0)
    }
    const firstValue = valueFor(first)
    const secondValue = valueFor(second)
    const result = typeof firstValue === 'string' ? firstValue.localeCompare(secondValue) : firstValue - secondValue
    return sortConfig.direction === 'asc' ? result : -result
  }), [calls, sortConfig])
  const requestSort = key => setSortConfig(current => ({
    key,
    direction: current.key === key ? (current.direction === 'desc' ? 'asc' : 'desc') : 'asc'
  }))
  const sortIndicator = key => sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'

  return (
    <section className="card analysis-section broker-calls">
      <div className="dividend-heading">
        <div>
          <h2>BROKER CALLS ({calls.length})</h2>
          <p>Model-derived strategy views using live technical data. Click any stock for the full analysis popup.</p>
        </div>
        <span className="dividend-count">6 desks</span>
      </div>
      <div className="broker-disclaimer">These are technical model signals mapped to broker-style strategy desks, not published recommendations from the named firms.</div>
      {calls.length === 0 ? (
        <div className="no-results">Broker calls will appear after market data loads.</div>
      ) : (
        <div className="table-wrapper">
          <table className="analysis-table broker-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th><button className="sort-header" onClick={() => requestSort('stock')}>Stock <span>{sortIndicator('stock')}</span></button></th>
                <th>Broker desk</th>
                <th><button className="sort-header" onClick={() => requestSort('call')}>Call <span>{sortIndicator('call')}</span></button></th>
                <th><button className="sort-header" onClick={() => requestSort('date')}>Signal date <span>{sortIndicator('date')}</span></button></th>
                <th>Current price</th>
                <th><button className="sort-header" onClick={() => requestSort('target')}>Target <span>{sortIndicator('target')}</span></button></th>
                <th>Stop-loss</th>
                <th><button className="sort-header" onClick={() => requestSort('upside')}>Upside <span>{sortIndicator('upside')}</span></button></th>
                <th>Horizon</th>
                <th><button className="sort-header" onClick={() => requestSort('confidence')}>Confidence <span>{sortIndicator('confidence')}</span></button></th>
              </tr>
            </thead>
            <tbody>
              {sortedCalls.map((item, index) => (
                <tr key={`${item.stock.symbol}-${item.broker.name}`} onClick={() => onSelect(item.stock)}>
                  <td className="rank">{index + 1}</td>
                  <td className="stock-name"><strong>{item.stock.s}</strong><small>{item.stock.n}</small></td>
                  <td><strong>{item.broker.name}</strong><small className="broker-style">{item.broker.style}</small></td>
                  <td><span className={`broker-call ${item.call.toLowerCase()}`}>{item.call}</span></td>
                  <td>{item.recommendationDate ? new Date(item.recommendationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td>₹{item.stock.currentPrice?.toFixed(2)}</td>
                  <td className="positive">₹{item.target.toFixed(2)}</td>
                  <td className="negative">₹{item.stopLoss.toFixed(2)}</td>
                  <td className={item.upside >= 0 ? 'positive' : 'negative'}>{item.upside >= 0 ? '+' : ''}{item.upside.toFixed(1)}%</td>
                  <td>{item.broker.horizon}</td>
                  <td><span className="confidence-meter"><i style={{ width: `${item.confidence}%` }} /><b>{item.confidence}%</b></span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function BrokerDirectory() {
  return (
    <section className="card analysis-section broker-directory">
      <div className="dividend-heading">
        <div>
          <h2>🔗 BROKERS</h2>
          <p>Open an official broker website to sign in or manage your account.</p>
        </div>
        <span className="dividend-count">External links</span>
      </div>
      <div className="broker-directory-grid">
        {BROKER_PROFILES.map(broker => (
          <a className="broker-directory-card" href={broker.url} target="_blank" rel="noreferrer" key={broker.name}>
            <div><strong>{broker.name}</strong><span>{broker.style}</span></div>
            <ExternalLink size={16} />
          </a>
        ))}
      </div>
    </section>
  )
}

function NewsMovers({ movers, loading, error, onSelect }) {
  const [sortConfig, setSortConfig] = useState({ key: 'change', direction: 'desc' })
  const sortedMovers = useMemo(() => [...movers].sort((first, second) => {
    const valueFor = item => {
      if (sortConfig.key === 'stock') return item.stock.n || item.stock.s
      if (sortConfig.key === 'news') return item.articles.length
      if (sortConfig.key === 'sector') return resolveSector(item.stock)
      return Number(item.stock.change || 0)
    }
    const firstValue = valueFor(first)
    const secondValue = valueFor(second)
    const result = typeof firstValue === 'string' ? firstValue.localeCompare(secondValue) : firstValue - secondValue
    return sortConfig.direction === 'asc' ? result : -result
  }), [movers, sortConfig])
  const requestSort = key => setSortConfig(current => ({
    key,
    direction: current.key === key ? (current.direction === 'desc' ? 'asc' : 'desc') : 'asc'
  }))
  const sortIndicator = key => sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'

  return (
    <section className="card analysis-section news-movers">
      <div className="dividend-heading">
        <div>
          <h2>NEWS MOVERS ({movers.length})</h2>
          <p>Only tracked stocks with a direct match in news published during the last seven days.</p>
        </div>
        <span className="dividend-count">Live feed</span>
      </div>
      {error && <div className="search-error">{error}</div>}
      {loading && movers.length === 0 ? (
        <div className="loading"><RefreshCw className="spin" size={24} /><p>Loading today's market news...</p></div>
      ) : movers.length === 0 ? (
        <div className="no-results">Market movers are not available yet.</div>
      ) : (
        <div className="table-wrapper">
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th><button className="sort-header" onClick={() => requestSort('stock')}>Stock <span>{sortIndicator('stock')}</span></button></th>
                <th><button className="sort-header" onClick={() => requestSort('change')}>Today <span>{sortIndicator('change')}</span></button></th>
                <th><button className="sort-header" onClick={() => requestSort('news')}>News <span>{sortIndicator('news')}</span></button></th>
                <th>Latest headline</th>
                <th><button className="sort-header" onClick={() => requestSort('sector')}>Sector <span>{sortIndicator('sector')}</span></button></th>
              </tr>
            </thead>
            <tbody>
              {sortedMovers.map(({ stock, articles }, index) => (
                <tr key={stock.symbol}>
                  <td className="rank">{index + 1}</td>
                  <td className="stock-name"><button className="news-stock-button" onClick={() => onSelect(stock)}><strong>{stock.s}</strong><small>{stock.n} | {resolveSector(stock)}</small></button></td>
                  <td className={stock.change >= 0 ? 'positive' : 'negative'}>{stock.change >= 0 ? '+' : ''}{formatChange(stock.change)}%</td>
                  <td><span className="news-count">{articles.length ? `${articles.length} match${articles.length === 1 ? '' : 'es'}` : 'Market mover'}</span></td>
                  <td className="news-headline">{articles[0] ? <a href={articles[0].link} target="_blank" rel="noreferrer">{articles[0].title}</a> : 'No direct headline match'}</td>
                  <td><span className="sector">{stock.c}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function PatternGrid({ patterns, onSelect, watchlistSymbols, onToggleWatchlist }) {
  return (
    <div className="patterns-grid">
      {patterns.length === 0 ? (
        <div className="no-results">No patterns found for this filter</div>
      ) : (
        patterns.map(stock => (
          <div key={stock.s} className="pattern-row" onClick={() => onSelect(stock)}>
            <button className={`pattern-watch-btn ${watchlistSymbols.includes(stock.symbol) ? 'watched' : ''}`} title={watchlistSymbols.includes(stock.symbol) ? 'Remove from watchlist' : 'Add to watchlist'} onClick={event => { event.stopPropagation(); onToggleWatchlist(stock) }}>
              <Star size={15} fill={watchlistSymbols.includes(stock.symbol) ? 'currentColor' : 'none'} />
            </button>
            <div className="pattern-stock">
              <strong>{stock.s}</strong>
              <span>{stock.n}</span>
              <small className="pattern-sector">{resolveSector(stock)} sector</small>
            </div>
            <div className="pattern-info-row">
              <span className={`pattern-type ${getPatternClass(stock.pattern)}`}>
                {stock.pattern.type}
              </span>
              <span className="pattern-confidence">
                {(stock.pattern.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            <div className="pattern-metrics">
              <span>Price: ₹{stock.currentPrice?.toFixed(2)}</span>
              <span>RSI: {stock.rsi?.toFixed(1)}</span>
              <span>Score: {stock.technicalScore}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function StockScreener({ stocks, onSelect }) {
  return (
    <section className="card analysis-section stock-screener">
      <div className="dividend-heading">
        <div><h2>🔎 STOCK SCREENER</h2><p>Stocks passing every momentum, trend, volume, liquidity, and valuation rule.</p></div>
        <span className="dividend-count">{stocks.length} matches</span>
      </div>
      <div className="screener-rules">Market cap &gt; ₹2,000 Cr · RSI 55–70 · Volume &gt; 1.5× 20-day average · Close above previous 20-day high · Within 10% of 52-week high · Average traded value &gt; ₹5 Cr/day</div>
      {stocks.length === 0 ? <div className="no-results">No stocks currently pass all screener rules. Market data or market-cap data may still be loading.</div> : (
        <div className="table-wrapper"><table className="analysis-table screener-table"><thead><tr><th>Stock</th><th>Market Cap</th><th>Price / 200 DMA</th><th>20 / 50 / 200 DMA</th><th>RSI</th><th>Volume</th><th>20D High</th><th>52W High</th><th>Avg traded value</th></tr></thead><tbody>{stocks.map(stock => (
          <tr key={stock.symbol} onClick={() => onSelect(stock)}><td className="stock-name"><strong>{stock.s}</strong><small>{stock.n} · {stock.sector}</small></td><td>₹{(stock.marketCap / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr</td><td>₹{stock.currentPrice.toFixed(2)} / ₹{stock.dma200.toFixed(2)}</td><td>{stock.dma20.toFixed(2)} / {stock.dma50.toFixed(2)} / {stock.dma200.toFixed(2)}</td><td>{stock.rsi.toFixed(1)}</td><td>{(stock.currentVolume / stock.averageVolume20).toFixed(2)}×</td><td>₹{stock.previous20High.toFixed(2)}</td><td>₹{stock.high52.toFixed(2)}</td><td>₹{(stock.averageTradedValue / 10000000).toFixed(1)} Cr</td></tr>
        ))}</tbody></table></div>
      )}
    </section>
  )
}

function FinancialsSection({ financials }) {
  const valuation = financials.valuation || {}
  const performance = financials.performance || {}
  const balanceSheet = financials.balanceSheet || {}
  const latestYear = financials.latestYear || {}
  const cards = [
    ['P/E ratio', formatFinancialNumber(valuation.pe)],
    ['Forward P/E', formatFinancialNumber(valuation.forwardPe)],
    ['P/BV ratio', formatFinancialNumber(valuation.priceToBook)],
    ['Market cap', formatFinancialNumber(valuation.marketCap, { currency: true })],
    ['Dividend yield', formatFinancialNumber(valuation.dividendYield, { percent: true })],
    ['Dividend / share', formatFinancialNumber(valuation.dividendPerShare, { currency: true })],
    ['Revenue growth', formatFinancialNumber(performance.revenueGrowth, { percent: true })],
    ['Gross margin', formatFinancialNumber(performance.grossMargin, { percent: true })],
    ['Profit margin', formatFinancialNumber(performance.profitMargin, { percent: true })],
    ['Return on equity', formatFinancialNumber(performance.returnOnEquity, { percent: true })],
    ['Return on assets', formatFinancialNumber(performance.returnOnAssets, { percent: true })],
    ['Debt / equity', formatFinancialNumber(balanceSheet.debtToEquity)]
  ]
  const cashFlow = balanceSheet.freeCashFlow
  const healthMessage = Number.isFinite(Number(performance.profitMargin))
    ? `${Number(performance.profitMargin) >= 0.1 ? 'Profitable' : 'Low-margin'} business${Number.isFinite(Number(balanceSheet.debtToEquity)) ? ` with ${Number(balanceSheet.debtToEquity) <= 100 ? 'moderate' : 'elevated'} leverage` : ''}.`
    : 'Review the latest reported metrics before making an investment decision.'

  return (
    <div className="financials-section">
      <div className="financials-heading">
        <div>
          <h3>Financial health</h3>
          <p>Latest available Yahoo Finance fundamentals</p>
        </div>
        <span className="financials-source">{financials.currency || 'INR'}</span>
      </div>
      <div className="financials-grid">
        {cards.map(([label, value]) => <div className="financial-metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </div>
      <div className="financials-summary">
        <strong>{healthMessage}</strong>
        <span>FCF {formatFinancialNumber(cashFlow, { currency: true })} · EPS {formatFinancialNumber(performance.eps, { currency: true })} · Operating cash flow {formatFinancialNumber(balanceSheet.operatingCashFlow, { currency: true })}</span>
      </div>
      <div className="financials-details">
        <div><span>Operating margin</span><b className={financialTone(performance.operatingMargin)}>{formatFinancialNumber(performance.operatingMargin, { percent: true })}</b></div>
        <div><span>Current ratio</span><b>{formatFinancialNumber(balanceSheet.currentRatio)}</b></div>
        <div><span>Latest net income</span><b>{formatFinancialNumber(latestYear.netIncome, { currency: true })}</b></div>
        <div><span>Total debt</span><b>{formatFinancialNumber(balanceSheet.totalDebt, { currency: true })}</b></div>
        <div><span>Gross profit</span><b>{formatFinancialNumber(performance.grossProfit, { currency: true })}</b></div>
        <div><span>Operating income</span><b>{formatFinancialNumber(performance.operatingIncome, { currency: true })}</b></div>
        <div><span>Total assets</span><b>{formatFinancialNumber(latestYear.totalAssets, { currency: true })}</b></div>
        <div><span>Total liabilities</span><b>{formatFinancialNumber(latestYear.totalLiabilities, { currency: true })}</b></div>
      </div>
      <small className="financials-disclaimer">Fundamentals are informational, may be delayed, and vary by sector. This is not investment advice.</small>
    </div>
  )
}

function StockDetailPanel({ stock, newsArticles, onClose, isWatched, onToggleWatchlist }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('oneYear')
  const [chartData, setChartData] = useState([])
  const [chartLoading, setChartLoading] = useState(true)
  const [financials, setFinancials] = useState(null)
  const [financialsLoading, setFinancialsLoading] = useState(true)
  const [showVwap, setShowVwap] = useState(true)
  const [zoomRange, setZoomRange] = useState({ startIndex: 0, endIndex: 0 })

  useEffect(() => {
    let cancelled = false
    const timeframe = CHART_TIMEFRAMES[selectedTimeframe]

    const loadChart = async () => {
      setChartLoading(true)
      const data = await fetchHistoricalData(stock.symbol, timeframe.range, timeframe.interval)
      if (!cancelled) {
        const chartVwap = data ? calculateVWAP(data.highs, data.lows, data.closes, data.volumes) : []
        const nextChart = data?.closes?.map((value, index) => ({
          name: data.timestamps[index] ? new Date(data.timestamps[index] * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '',
          open: Number(data.opens[index].toFixed(2)),
          high: Number(data.highs[index].toFixed(2)),
          low: Number(data.lows[index].toFixed(2)),
          close: Number(Number(value).toFixed(2)),
          range: [Number(data.lows[index].toFixed(2)), Number(data.highs[index].toFixed(2))],
          vwap: Number((chartVwap[index] ?? value).toFixed(2))
        })) || []
        setChartData(nextChart)
        setZoomRange({ startIndex: 0, endIndex: Math.max(0, nextChart.length - 1) })
        setChartLoading(false)
      }
    }

    loadChart()
    return () => { cancelled = true }
  }, [selectedTimeframe, stock.symbol, stock.chart])

  useEffect(() => {
    let cancelled = false
    setFinancialsLoading(true)
    setFinancials(null)
    fetchFinancials(stock.symbol).then(data => {
      if (!cancelled) {
        setFinancials(data)
        setFinancialsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [stock.symbol])

  const changeZoom = (direction) => {
    setZoomRange(current => {
      const startIndex = current.startIndex || 0
      const endIndex = current.endIndex || Math.max(0, chartData.length - 1)
      const span = endIndex - startIndex + 1
      const adjustment = Math.max(1, Math.floor(span * 0.2))
      if (direction === 'in' && span > 5) return { startIndex: startIndex + adjustment, endIndex: endIndex - adjustment }
      return { startIndex: Math.max(0, startIndex - adjustment), endIndex: Math.min(chartData.length - 1, endIndex + adjustment) }
    })
  }

  const prosCons = getStockProsCons(stock, financials)
  const relatedNews = getRelatedNews(stock, newsArticles || [])
  const downloadStockReport = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const margin = 36
    const reportValue = value => value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? '0' : Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })
    const reportPercent = value => `${reportValue(Number(value) * 100)}%`
    const addSection = (title, rows, color = [23, 32, 51]) => {
      autoTable(doc, {
        startY: doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 16 : 180,
        head: [[title, 'Value']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: color, textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8, textColor: [40, 50, 70] },
        alternateRowStyles: { fillColor: [246, 249, 253] },
        columnStyles: { 0: { cellWidth: 190 }, 1: { cellWidth: 330 } },
        margin: { left: margin, right: margin }
      })
    }

    doc.setFontSize(18)
    doc.setTextColor(23, 32, 51)
    doc.text(`${stock.s} - ${stock.n}`, margin, 42)
    doc.setFontSize(9)
    doc.setTextColor(100, 112, 135)
    doc.text(`Stock Pulse India report | ${new Date().toLocaleString('en-IN')}`, margin, 58)
    doc.text(`${stock.c || 'Stock'} | ${resolveSector(stock)} | ${stock.symbol || stock.s}`, margin, 72)

    const chartX = margin
    const chartY = 88
    const chartWidth = 260
    const chartHeight = 68
    doc.setFillColor(239, 246, 255)
    doc.roundedRect(chartX, chartY, chartWidth, chartHeight, 7, 7, 'F')
    doc.setFontSize(8)
    doc.setTextColor(72, 103, 232)
    doc.text(`${CHART_TIMEFRAMES[selectedTimeframe].label} price trend`, chartX + 10, chartY + 14)
    const pricePoints = chartData.slice(-30).map(candle => Number(candle.close)).filter(Number.isFinite)
    if (pricePoints.length > 1) {
      const minimum = Math.min(...pricePoints)
      const maximum = Math.max(...pricePoints)
      const spread = maximum - minimum || 1
      doc.setDrawColor(pricePoints.at(-1) >= pricePoints[0] ? 8 : 224, pricePoints.at(-1) >= pricePoints[0] ? 159 : 82, pricePoints.at(-1) >= pricePoints[0] ? 110 : 82)
      doc.setLineWidth(2)
      for (let index = 1; index < pricePoints.length; index += 1) {
        const x1 = chartX + 10 + ((index - 1) / (pricePoints.length - 1)) * (chartWidth - 20)
        const x2 = chartX + 10 + (index / (pricePoints.length - 1)) * (chartWidth - 20)
        const y1 = chartY + chartHeight - 10 - ((pricePoints[index - 1] - minimum) / spread) * (chartHeight - 28)
        const y2 = chartY + chartHeight - 10 - ((pricePoints[index] - minimum) / spread) * (chartHeight - 28)
        doc.line(x1, y1, x2, y2)
      }
    }

    const metricCard = (x, y, label, value, color) => {
      doc.setFillColor(...color)
      doc.roundedRect(x, y, 112, 30, 6, 6, 'F')
      doc.setFontSize(7)
      doc.setTextColor(80, 95, 120)
      doc.text(label, x + 8, y + 11)
      doc.setFontSize(11)
      doc.setTextColor(23, 32, 51)
      doc.text(value, x + 8, y + 24)
    }
    metricCard(310, 88, 'Current price', `INR ${reportValue(stock.currentPrice)}`, [231, 247, 243])
    metricCard(430, 88, 'Daily change', `${reportValue(stock.change)}%`, [255, 242, 221])
    metricCard(310, 124, 'Technical score', `${reportValue(stock.technicalScore)}/100`, [238, 241, 255])
    metricCard(430, 124, 'Profit probability', `${reportValue(stock.profitProbability)}%`, [255, 234, 234])

    addSection('About the stock', [[getStockDescription(stock), `${resolveSector(stock)} sector`]], [72, 103, 232])

    addSection('Market overview', [
      ['Current price', `INR ${reportValue(stock.currentPrice)}`],
      ['Previous close', `INR ${reportValue(stock.previousClose)}`],
      ['Daily change', `${reportValue(stock.change)}%`],
      ['52-week range', `INR ${reportValue(stock.low52)} - INR ${reportValue(stock.high52)}`],
      ['Market cap', `INR ${formatFinancialNumber(stock.marketCap, { currency: true })}`],
      ['Latest market date', stock.latestMarketDate || '0']
    ], [23, 143, 120])
    addSection('Technical analysis', [
      ['Trend / structure', `${stock.marketStructure?.trend || 'Neutral'} / ${stock.marketStructure?.structure || 'Unknown'}`],
      ['Pattern', `${stock.pattern?.type || 'Consolidation'} (${stock.pattern?.direction || 'Neutral'})`],
      ['RSI (14)', reportValue(stock.rsi)],
      ['MACD / signal', `${reportValue(stock.macd)} / ${reportValue(stock.signal)}`],
      ['MACD histogram', reportValue(stock.macdHistogram)],
      ['ADX (14)', reportValue(stock.adx)],
      ['VWAP', `INR ${reportValue(stock.vwap)}`],
      ['EMA 9 / 20 / 50 / 200', [stock.ema9, stock.ema20, stock.ema50, stock.ema200].map(reportValue).join(' / ')],
      ['DMA 20 / 50 / 200', [stock.dma20, stock.dma50, stock.dma200].map(reportValue).join(' / ')],
      ['Support / resistance / pivot', [stock.support, stock.resistance, stock.pivot].map(reportValue).join(' / ')],
      ['Volume RVOL', `${reportValue(stock.volumeAnalysis?.rvol)}x`],
      ['Technical score', `${reportValue(stock.technicalScore)}/100`]
    ], [72, 103, 232])
    addSection('Risk management', [
      ['Intraday bias', `${stock.intradayBias || 'Neutral'} (${stock.intradayRiskDirection || 'Neutral'})`],
      ['Intraday target / stop-loss', `INR ${reportValue(stock.intradayTarget)} / INR ${reportValue(stock.intradayStopLoss)}`],
      ['Intraday ATR / session range', `INR ${reportValue(stock.intradayAtr)} / INR ${reportValue(stock.intradaySessionLow)} - INR ${reportValue(stock.intradaySessionHigh)}`],
      ['Swing bias', `${stock.swingBias || 'Neutral'} (${stock.swingRiskDirection || 'Neutral'})`],
      ['Swing target / stop-loss', `INR ${reportValue(stock.swingTarget)} / INR ${reportValue(stock.swingStopLoss)}`],
      ['Risk-reward', reportValue(stock.riskReward)]
    ], [208, 138, 34])
    addSection('DVM and probability', [
      ['DVM score', `${reportValue(stock.dvm?.score)}/100`],
      ['Durability / valuation / momentum', [stock.dvm?.durability, stock.dvm?.valuation, stock.dvm?.momentum].map(value => `${reportValue(value)}/100`).join(' / ')],
      ['Profit probability', `${reportValue(stock.profitProbability)}%`],
      ['Intraday / swing bias', `${stock.intradayBias || 'Neutral'} / ${stock.swingBias || 'Neutral'}`]
    ], [139, 98, 201])

    if (financials) {
      const valuation = financials.valuation || {}
      const performance = financials.performance || {}
      const balanceSheet = financials.balanceSheet || {}
      const latestYear = financials.latestYear || {}
      addSection('Financial health', [
        ['P/E / forward P/E / P/BV', [valuation.pe, valuation.forwardPe, valuation.priceToBook].map(reportValue).join(' / ')],
        ['Dividend yield / per share', `${reportPercent(valuation.dividendYield)} / INR ${reportValue(valuation.dividendPerShare)}`],
        ['Revenue / gross profit', `INR ${formatFinancialNumber(performance.revenue, { currency: true })} / INR ${formatFinancialNumber(performance.grossProfit, { currency: true })}`],
        ['Revenue growth / gross margin', `${reportPercent(performance.revenueGrowth)} / ${reportPercent(performance.grossMargin)}`],
        ['Profit margin / operating margin', `${reportPercent(performance.profitMargin)} / ${reportPercent(performance.operatingMargin)}`],
        ['ROE / ROA', `${reportPercent(performance.returnOnEquity)} / ${reportPercent(performance.returnOnAssets)}`],
        ['Debt / equity / current ratio', `${reportValue(balanceSheet.debtToEquity)} / ${reportValue(balanceSheet.currentRatio)}`],
        ['Net income / total assets / liabilities', `INR ${formatFinancialNumber(latestYear.netIncome, { currency: true })} / INR ${formatFinancialNumber(latestYear.totalAssets, { currency: true })} / INR ${formatFinancialNumber(latestYear.totalLiabilities, { currency: true })}`],
        ['Free cash flow / operating cash flow', `INR ${formatFinancialNumber(balanceSheet.freeCashFlow, { currency: true })} / INR ${formatFinancialNumber(balanceSheet.operatingCashFlow, { currency: true })}`]
      ], [8, 143, 120])
    }

    addSection('Pros and cons', [
      ['Pros', prosCons.pros.join(' | ') || '0'],
      ['Cons', prosCons.cons.join(' | ') || '0']
    ], [224, 82, 82])

    if (relatedNews.length) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [['Related news', 'Source / published']],
        body: relatedNews.slice(0, 10).map(article => [article.title, `${article.source || 'News'} | ${article.publishedAt || '0'}`]),
        theme: 'grid',
        headStyles: { fillColor: [23, 32, 51], textColor: 255, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        margin: { left: margin, right: margin },
        columnStyles: { 0: { cellWidth: 350 }, 1: { cellWidth: 170 } }
      })
    }

    if (chartData.length) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [[`${CHART_TIMEFRAMES[selectedTimeframe].label} chart data`, 'Open', 'High', 'Low', 'Close', 'VWAP']],
        body: chartData.slice(-30).map(candle => [candle.name, reportValue(candle.open), reportValue(candle.high), reportValue(candle.low), reportValue(candle.close), reportValue(candle.vwap)]),
        theme: 'grid',
        headStyles: { fillColor: [23, 32, 51], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        margin: { left: margin, right: margin }
      })
    }

    doc.setFontSize(8)
    doc.setTextColor(100, 112, 135)
    doc.text('Data is informational and may be delayed. This report is not investment advice.', margin, 806)
    doc.save(`${stock.s || 'stock'}-stock-report.pdf`)
  }

  return (
    <div className="detail-panel">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-name-row">
            <h2><span className="popup-symbol">{stock.s}</span><span className="popup-company"> - {stock.n}</span></h2>
          </div>
          <p>{stock.c} | {resolveSector(stock)}</p>
          <div className="popup-dvm-summary">
            <strong>DVM {stock.dvm?.score || 0}/100</strong>
            <span className={`dvm-status ${getDvmTone(stock.dvm?.score)}`}>{getDvmStatus(stock.dvm)}</span>
            <small>Durability {stock.dvm?.durability || 0} · Valuation {stock.dvm?.valuation || 0} · Momentum {stock.dvm?.momentum || 0}</small>
          </div>
        </div>
        <div className="panel-actions">
          <a
            className="tradingview-header-link"
            href={`https://www.tradingview.com/chart/?symbol=${stock.symbol?.endsWith('.BO') ? 'BSE' : 'NSE'}:${stock.symbol?.replace(/\.(NS|BO)$/, '') || stock.s}`}
            target="_blank"
            rel="noreferrer"
            title={`Open ${stock.s} in TradingView`}
          >
            <LineChart size={14} /> TradingView <ExternalLink size={12} />
          </a>
          <button className="panel-report-btn" onClick={downloadStockReport} title="Download complete stock report as PDF" aria-label="Download complete stock report as PDF">
            <Download size={14} /> Report PDF
          </button>
          <button className={`panel-watch-btn ${isWatched ? 'watched' : ''}`} onClick={() => onToggleWatchlist(stock)}>
            <Star size={16} fill={isWatched ? 'currentColor' : 'none'} />
            {isWatched ? 'Watching' : 'Add to Watchlist'}
          </button>
        </div>
        <button onClick={onClose} className="close-btn"><X size={24} /></button>
      </div>

      <div className="panel-content">
        <div className="price-section">
          <div className="current-price">
            <span>Current Price</span>
            <strong>₹{stock.currentPrice?.toFixed(2)}</strong>
            <span className={stock.change >= 0 ? 'positive' : 'negative'}>
              {stock.change >= 0 ? '+' : ''}{formatChange(stock.change)}%
            </span>
          </div>
        </div>

        <div className="stock-summary">
          <div className="stock-summary-heading"><h3>Stock Summary</h3><span className={`summary-signal ${stock.change >= 0 ? 'positive' : 'negative'}`}>{stock.change >= 0 ? 'Positive day' : 'Negative day'}</span></div>
          <p className="stock-description"><strong>About the stock:</strong> {getStockDescription(stock)}</p>
          <p>{getStockSummary(stock)}</p>
          <div className="stock-summary-grid">
            <div><span>Trend</span><strong>{stock.marketStructure?.trend || 'Neutral'}</strong></div>
            <div><span>Pattern</span><strong>{stock.pattern?.type || 'Consolidation'}</strong></div>
            <div><span>RSI</span><strong>{Number.isFinite(Number(stock.rsi)) ? stock.rsi.toFixed(1) : 'N/A'}</strong></div>
            <div><span>Technical score</span><strong>{stock.technicalScore || 0}/100</strong></div>
          </div>
        </div>

        <div className="pros-cons-section">
          <div className="pros-cons-column pros">
            <h3>Pros</h3>
            {prosCons.pros.length ? prosCons.pros.map(pro => <p key={pro}>+ {pro}</p>) : <p>Positive factors are still being evaluated.</p>}
          </div>
          <div className="pros-cons-column cons">
            <h3>Cons</h3>
            {prosCons.cons.length ? prosCons.cons.map(con => <p key={con}>- {con}</p>) : <p>No major warning signal detected by the current model.</p>}
          </div>
        </div>

        {financialsLoading ? (
          <div className="financials-loading">Loading financial health...</div>
        ) : financials ? (
          <FinancialsSection financials={financials} />
        ) : (
          <div className="financials-loading">Financial data is temporarily unavailable.</div>
        )}

        <div className="detail-chart">
          <div className="detail-chart-header">
            <h3>Recent Price Candles</h3>
            <span>{CHART_TIMEFRAMES[selectedTimeframe].detail}</span>
          </div>
          <div className="chart-timeframes" role="group" aria-label="Chart timeframe">
            {Object.entries(CHART_TIMEFRAMES).map(([key, timeframe]) => (
              <button key={key} className={selectedTimeframe === key ? 'active' : ''} onClick={() => setSelectedTimeframe(key)}>
                {timeframe.label}
              </button>
            ))}
          </div>
          <div className="chart-zoom-controls" role="group" aria-label="Chart zoom">
            <span>Zoom</span>
            <button onClick={() => changeZoom('in')} disabled={chartData.length < 6}>+</button>
            <button onClick={() => changeZoom('out')} disabled={chartData.length < 2}>−</button>
            <button onClick={() => setZoomRange({ startIndex: 0, endIndex: Math.max(0, chartData.length - 1) })} disabled={chartData.length < 2}>Reset</button>
            <small>Drag the handles below to select a range</small>
            <button className={showVwap ? 'active' : ''} onClick={() => setShowVwap(current => !current)} disabled={chartData.length < 2}>VWAP</button>
          </div>
          {chartLoading ? (
            <div className="detail-chart-empty">Loading chart...</div>
          ) : chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barCategoryGap="18%">
                <XAxis dataKey="name" hide />
                <YAxis domain={['dataMin', 'dataMax']} hide />
                <Tooltip content={<CandlestickTooltip />} />
                <Bar dataKey="range" shape={CandlestickShape} />
                {showVwap && <Line type="monotone" dataKey="vwap" stroke="#d28a22" strokeWidth={2} dot={false} name="VWAP" />}
                <Brush dataKey="name" height={25} stroke="#4c63d9" travellerWidth={8} startIndex={zoomRange.startIndex} endIndex={zoomRange.endIndex} onChange={({ startIndex, endIndex }) => setZoomRange({ startIndex, endIndex })} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="detail-chart-empty">Price chart unavailable</div>
          )}
        </div>

        <div className="indicators-grid">
          <div className="indicator-box">
            <label>RSI (14)</label>
            <strong>{stock.rsi?.toFixed(2)}</strong>
            <small>{stock.rsi > 70 ? 'Overbought' : stock.rsi < 30 ? 'Oversold' : 'Neutral'}</small>
          </div>
          <div className="indicator-box">
            <label>MACD (12, 26, 9)</label>
            <strong>{stock.macd?.toFixed(2)}</strong>
            <small>Signal {stock.signal?.toFixed(2)} · {stock.macdHistogram >= 0 ? 'Bullish' : 'Bearish'}</small>
          </div>
          <div className="indicator-box">
            <label>ADX (14)</label>
            <strong>{stock.adx?.toFixed(2)}</strong>
            <small>{stock.adx > 25 ? 'Strong trend' : 'Weak / sideways'} · {stock.marketStructure?.trend || 'Neutral'}</small>
          </div>
          <div className="indicator-box">
            <label>Volume RVOL</label>
            <strong>{stock.volumeAnalysis?.rvol?.toFixed(2)}x</strong>
            <small>{stock.volumeAnalysis?.trendVolume}</small>
          </div>
          <div className="indicator-box">
            <label>VWAP</label>
            <strong>₹{stock.vwap?.toFixed(2)}</strong>
            <small>{stock.currentPrice >= stock.vwap ? 'Price above VWAP' : 'Price below VWAP'}</small>
          </div>
          <div className="indicator-box">
            <label>Intraday Bias</label>
            <strong>{stock.intradayBias || 'Neutral'}</strong>
            <small>Target {stock.intradayTarget?.toFixed(2)} | SL {stock.intradayStopLoss?.toFixed(2)}</small>
          </div>
          <div className="indicator-box">
            <label>Swing Bias</label>
            <strong>{stock.swingBias || 'Neutral'}</strong>
            <small>Target {stock.swingTarget?.toFixed(2)} | SL {stock.swingStopLoss?.toFixed(2)}</small>
          </div>
        </div>

        <div className="support-resistance">
          <h3>Risk Management</h3>
          <div className="level">
            <span>Intraday Target ({stock.intradayRiskDirection || 'Long'})</span>
            <strong>₹{stock.intradayTarget?.toFixed(2)}</strong>
          </div>
          <div className="level">
            <span>Intraday SL ({stock.intradayRiskDirection || 'Long'})</span>
            <strong>₹{stock.intradayStopLoss?.toFixed(2)}</strong>
          </div>
          <div className="level">
            <span>Swing Target ({stock.swingRiskDirection || 'Long'})</span>
            <strong>₹{stock.swingTarget?.toFixed(2)}</strong>
          </div>
          <div className="level">
            <span>Swing SL ({stock.swingRiskDirection || 'Long'})</span>
            <strong>₹{stock.swingStopLoss?.toFixed(2)}</strong>
          </div>
        </div>

        <div className="ema-section">
          <h3>EMA Alignment</h3>
          <div className="ema-check">
            {stock.currentPrice > stock.ema9 ? <CheckCircle size={16} className="check" /> : <AlertCircle size={16} className="alert" />}
            <span>Price &gt; EMA 9: {stock.currentPrice?.toFixed(2)} &gt; {stock.ema9?.toFixed(2)}</span>
          </div>
          <div className="ema-check">
            {stock.ema9 > stock.ema20 ? <CheckCircle size={16} className="check" /> : <AlertCircle size={16} className="alert" />}
            <span>EMA 9 &gt; EMA 20: {stock.ema9?.toFixed(2)} &gt; {stock.ema20?.toFixed(2)}</span>
          </div>
          <div className="ema-check">
            {stock.ema20 > stock.ema50 ? <CheckCircle size={16} className="check" /> : <AlertCircle size={16} className="alert" />}
            <span>EMA 20 &gt; EMA 50: {stock.ema20?.toFixed(2)} &gt; {stock.ema50?.toFixed(2)}</span>
          </div>
          <div className="ema-check">
            {stock.ema50 > stock.ema200 ? <CheckCircle size={16} className="check" /> : <AlertCircle size={16} className="alert" />}
            <span>EMA 50 &gt; EMA 200: {stock.ema50?.toFixed(2)} &gt; {stock.ema200?.toFixed(2)}</span>
          </div>
        </div>

        <div className="support-resistance">
          <h3>Support & Resistance</h3>
          <div className="level">
            <span>Resistance</span>
            <strong>₹{stock.resistance?.toFixed(2)}</strong>
          </div>
          <div className="level">
            <span>Pivot</span>
            <strong>₹{stock.pivot?.toFixed(2)}</strong>
          </div>
          <div className="level">
            <span>Support</span>
            <strong>₹{stock.support?.toFixed(2)}</strong>
          </div>
        </div>

        {stock.pattern && (
          <div className="pattern-analysis">
            <h3>Chart Pattern</h3>
            <div className={`pattern-info-full ${getPatternClass(stock.pattern)}`}>
              <div className="pattern-type-display">{stock.pattern.type}</div>
              <div className="pattern-details">
                <span>Direction: <strong>{stock.pattern.direction}</strong></span>
                <span>Confidence: <strong>{(stock.pattern.confidence * 100).toFixed(0)}%</strong></span>
                <span>Breakout Level: <strong>₹{stock.pattern.breakoutLevel?.toFixed(2)}</strong></span>
              </div>
            </div>
          </div>
        )}

        <div className="market-structure">
          <h3>Market Structure</h3>
          <div className="structure-info">
            <span>Trend: <strong>{stock.marketStructure?.trend}</strong></span>
            <span>Structure: <strong>{stock.marketStructure?.structure}</strong></span>
          </div>
        </div>

        <div className="score-breakdown">
          <h3>Technical Score: {stock.technicalScore}/100</h3>
          <div className="score-bar">
            <div className="fill" style={{width: `${stock.technicalScore}%`}}></div>
          </div>
        </div>

        {stock.dividends?.length > 0 && (
          <div className="support-resistance dividend-details">
            <h3>Dividend Details</h3>
            {stock.dividends.map(dividend => (
              <div className="level" key={`${dividend.date}-${dividend.amount}`}>
                <span>{new Date(dividend.date * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} | {dividend.type}</span>
                <strong>₹{dividend.amount.toFixed(2)} / share</strong>
              </div>
            ))}
          </div>
        )}

        <div className="external-links">
          <a href={`https://www.nseindia.com/market-data/live-equity-market`} target="_blank" rel="noreferrer">
            <Globe2 size={16} /> NSE Market
          </a>
          <a href="https://www.moneycontrol.com/news/business/markets/" target="_blank" rel="noreferrer">
            <Newspaper size={16} /> Moneycontrol
          </a>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<StockAnalysisDashboard />)
