import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BarChart3, Bell, BookOpen, ExternalLink, Gauge, Globe2, Layers3, LineChart,
  Menu, Newspaper, RefreshCw, Search, ShieldCheck, Sparkles, Star, TrendingDown, TrendingUp, X, Download,
  AlertCircle, CheckCircle, Zap, Activity, Send, Bot
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart as RechartsLine, Line } from 'recharts'
import * as XLSX from 'xlsx'
import { calculateEMA, calculateRSI, calculateMACD, calculateADX, calculateVWAP, detectChartPattern, calculateMarketStructure, calculateSuportResistance, calculateVolumAnalysis, scoreSetup } from './technicalAnalysis'
import './styles.css'

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

const BROKER_PROFILES = [
  { name: 'Axis Securities', style: 'Momentum desk', horizon: '1-3 weeks', bias: 1.05 },
  { name: 'Motilal Oswal', style: 'Swing desk', horizon: '2-6 weeks', bias: 1.1 },
  { name: 'ICICI Securities', style: 'Trend desk', horizon: '1-3 months', bias: 1 },
  { name: 'HDFC Securities', style: 'Risk-managed desk', horizon: '2-4 weeks', bias: 0.95 },
  { name: 'Kotak Securities', style: 'Technical desk', horizon: '1-2 months', bias: 1.08 },
  { name: 'Sharekhan', style: 'Positional desk', horizon: '1-3 months', bias: 0.98 }
]

const CHART_TIMEFRAMES = {
  day: { label: 'Day', range: '1d', interval: '5m', detail: 'today - 5 min' },
  week: { label: 'Week', range: '5d', interval: '15m', detail: '5 days - 15 min' },
  month: { label: 'Month', range: '1mo', interval: '1d', detail: '1 month - daily' },
  year: { label: 'Year', range: '1y', interval: '1d', detail: '1 year - daily' }
}

const fetchHistoricalData = async (symbol, range = '5y', interval = '1d') => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  const requestUrl = `${apiBaseUrl}/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&events=div`
  let lastError

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      const response = await fetch(requestUrl, { signal: controller.signal })
      clearTimeout(timeoutId)

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

      const validIndexes = closes
        .map((value, index) => (Number.isFinite(Number(value)) ? index : null))
        .filter(index => index !== null)

      if (validIndexes.length < 2) return null

      const safeSlice = (arr) => validIndexes.map(index => Number(arr[index])).filter(value => Number.isFinite(value))

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

const analyzeStock = async (stock) => {
  const data = await fetchHistoricalData(stock.symbol)
  if (!data) return null
  
  const { closes, highs, lows, volumes, meta, dividends } = data
  if (!closes || closes.length < 30) return null

  const currentPrice = Number(meta?.regularMarketPrice ?? closes[closes.length - 1])
  const previousClose = Number(meta?.previousClose ?? closes[closes.length - 2] ?? currentPrice)
  const change = previousClose ? ((currentPrice - previousClose) / previousClose) * 100 : 0
  
  const ema9 = calculateEMA(closes, 9)
  const ema20 = calculateEMA(closes, 20)
  const ema50 = calculateEMA(closes, 50)
  const ema200 = calculateEMA(closes, 200)
  const rsi = calculateRSI(closes, 14)
  const { macd, signal } = calculateMACD(closes)
  const vwap = calculateVWAP(highs, lows, closes, volumes)
  const { adx } = calculateADX(highs, lows, closes, 14)
  const { support, resistance, pivot } = calculateSuportResistance(highs, lows, closes)
  const volAnalysis = calculateVolumAnalysis(volumes, closes)
  const pattern = detectChartPattern(highs, lows, closes, volumes)
  const structure = calculateMarketStructure(highs, lows, closes)
  
  const chart = closes.map((val, index) => ({
    name: data.timestamps[index] ? new Date(data.timestamps[index] * 1000).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '',
    value: Number(Number(val).toFixed(2))
  }))
  const chartPreview = chart.slice(-20)

  const latestRsi = Number(rsi[rsi.length - 1] ?? 50)
  const latestMacd = Number(macd[macd.length - 1] ?? 0)
  const latestSignal = Number(signal[signal.length - 1] ?? 0)
  const latestVwap = Number(vwap[vwap.length - 1] ?? currentPrice)
  const latestAdx = Number(adx[adx.length - 1] ?? 0)
  const latestEma9 = Number(ema9[ema9.length - 1] ?? currentPrice)
  const latestEma20 = Number(ema20[ema20.length - 1] ?? currentPrice)
  const latestEma50 = Number(ema50[ema50.length - 1] ?? currentPrice)
  const latestEma200 = Number(ema200[ema200.length - 1] ?? currentPrice)

  const intradayBias = currentPrice > latestVwap && latestRsi > 55 && latestRsi < 70 && latestMacd > latestSignal ? 'Bullish' :
    currentPrice < latestVwap && latestRsi < 45 ? 'Bearish' : 'Neutral'

  const swingBias = latestEma20 > latestEma50 && latestEma50 > latestEma200 && latestAdx > 25 ? 'Bullish' :
    latestEma20 < latestEma50 && latestEma50 < latestEma200 ? 'Bearish' : 'Neutral'

  const intradayStopLoss = Number(Math.min(support, currentPrice) * 0.985 || currentPrice * 0.985)
  const intradayTarget = Number((currentPrice + Math.max(0.015, (currentPrice - intradayStopLoss) * 1.8)).toFixed(2))
  const swingStopLoss = Number((support * 0.96 || currentPrice * 0.96).toFixed(2))
  const swingTarget = Number((currentPrice + Math.max(0.02, (currentPrice - swingStopLoss) * 2.2)).toFixed(2))
  const intradayProfitZone = Math.max(currentPrice, intradayTarget)
  const swingProfitZone = Math.max(currentPrice, swingTarget)

  const analysisData = {
    ...stock,
    currentPrice,
    previousClose,
    change,
    ema9: latestEma9,
    ema20: latestEma20,
    ema50: latestEma50,
    ema200: latestEma200,
    rsi: latestRsi,
    macd: latestMacd,
    signal: latestSignal,
    vwap: latestVwap,
    adx: latestAdx,
    support,
    resistance,
    pivot,
    volumeAnalysis: volAnalysis,
    pattern,
    marketStructure: structure,
    chart,
    chartPreview,
    dividends,
    high52: Math.max(...closes),
    low52: Math.min(...closes),
    riskReward: 2,
    intradayBias,
    swingBias,
    intradayProfitZone,
    swingProfitZone,
    intradayTarget,
    intradayStopLoss,
    swingTarget,
    swingStopLoss
  }
  
  const scored = scoreSetup(analysisData)
  analysisData.technicalScore = scored.technicalScore
  
  return analysisData
}

function StockAnalysisDashboard() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStock, setSelectedStock] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [nseDividends, setNseDividends] = useState([])
  const [dividendLoading, setDividendLoading] = useState(false)
  const [dividendError, setDividendError] = useState('')
  const [newsArticles, setNewsArticles] = useState([])
  const [newsLoading, setNewsLoading] = useState(false)
  const [newsError, setNewsError] = useState('')
  const [watchlistSymbols, setWatchlistSymbols] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('stock-pulse-watchlist') || '[]')
    } catch {
      return []
    }
  })
  const [tab, setTab] = useState('top30')
  const [menu, setMenu] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: 'change', direction: 'desc' })

  const handleStockSearch = async (event) => {
    event.preventDefault()
    const input = searchQuery.trim().toUpperCase()
    if (!input) return

    const exchange = input.startsWith('BSE:') || input.endsWith('.BO') ? 'BSE' : 'NSE'
    const rawSymbol = input.replace(/^(NSE|BSE):/, '').replace(/\.(NS|BO)$/, '')
    if (!/^[A-Z0-9&-]+$/.test(rawSymbol)) {
      setSearchError('Enter a valid NSE/BSE symbol, such as RELIANCE or BSE:TCS.')
      return
    }

    const symbol = `${rawSymbol}.${exchange === 'BSE' ? 'BO' : 'NS'}`
    const knownStock = STOCK_CONFIG.find(stock => stock.symbol === symbol)
    const stock = knownStock || {
      s: rawSymbol,
      n: rawSymbol,
      symbol,
      c: 'Searched Stock',
      sector: 'Unclassified'
    }

    setSearching(true)
    setSearchError('')
    const result = await analyzeStock(stock)
    setSearching(false)

    if (!result) {
      setSearchError(`No market data found for ${exchange}:${rawSymbol}. Check the symbol and exchange.`)
      return
    }

    setStocks(current => current.some(stockItem => stockItem.symbol === result.symbol) ? current : [result, ...current])
    setSelectedStock(result)
  }
  
  useEffect(() => {
    const loadAnalysis = async () => {
      setLoading(true)
      try {
        // Load in batches of 5 to avoid overwhelming the API
        const batchSize = 5
        let allResults = []
        
        for (let i = 0; i < STOCK_CONFIG.length; i += batchSize) {
          const batch = STOCK_CONFIG.slice(i, i + batchSize)
          const results = await Promise.all(batch.map(s => analyzeStock(s)))
          allResults = [...allResults, ...results]
          
          // Update UI with partial results
          const filtered = allResults.filter(s => s !== null)
          if (filtered.length > 0) {
            const sorted = filtered.sort((a, b) => (b.technicalScore || 0) - (a.technicalScore || 0))
            setStocks(sorted)
          }
        }
        
        const filtered = allResults.filter(s => s !== null)
        const sorted = filtered.sort((a, b) => (b.technicalScore || 0) - (a.technicalScore || 0))
        setStocks(sorted)
      } catch (error) {
        console.error('Error loading analysis:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadAnalysis()
    const interval = setInterval(loadAnalysis, 600000) // 10 minutes
    return () => clearInterval(interval)
  }, [])

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
    const interval = setInterval(loadNews, 300000)
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
    const interval = setInterval(loadNseDividends, 300000)
    return () => clearInterval(interval)
  }, [])
  
  const sortStocks = (items) => [...items].sort((a, b) => {
    const valueA = sortConfig.key === 'name' ? a.n || a.s : sortConfig.key === 'volume' ? a.volumeAnalysis?.rvol || 0 : a[sortConfig.key] || 0
    const valueB = sortConfig.key === 'name' ? b.n || b.s : sortConfig.key === 'volume' ? b.volumeAnalysis?.rvol || 0 : b[sortConfig.key] || 0
    const result = typeof valueA === 'string' ? valueA.localeCompare(valueB) : valueA - valueB
    return sortConfig.direction === 'asc' ? result : -result
  })

  const largeCaps = useMemo(() => sortStocks(stocks.filter(s => s.c === 'Large Cap')).slice(0, 100), [stocks, sortConfig])
  const midCaps = useMemo(() => sortStocks(stocks.filter(s => s.c === 'Mid Cap')).slice(0, 100), [stocks, sortConfig])
  const smallCaps = useMemo(() => sortStocks(stocks.filter(s => s.c === 'Small Cap')).slice(0, 100), [stocks, sortConfig])
  const top100 = useMemo(() => sortStocks(stocks).slice(0, 100), [stocks, sortConfig])
  const sortPatterns = (items) => [...items].sort((first, second) => {
    const confidenceDifference = (second.pattern?.confidence || 0) - (first.pattern?.confidence || 0)
    return confidenceDifference || (second.technicalScore || 0) - (first.technicalScore || 0)
  })
  const bullishPatterns = useMemo(() => sortPatterns(stocks.filter(s => s.pattern?.direction === 'Bullish')), [stocks])
  const bearishPatterns = useMemo(() => sortPatterns(stocks.filter(s => s.pattern?.direction === 'Bearish')), [stocks])
  const watchlistStocks = useMemo(() => sortStocks(stocks.filter(stock => watchlistSymbols.includes(stock.symbol))), [stocks, watchlistSymbols, sortConfig])
  const newsMovers = useMemo(() => {
    const ranked = stocks.map(stock => {
    const keywords = [stock.s, stock.n, stock.symbol.replace(/\.(NS|BO)$/, '')].map(value => value.toLowerCase())
    const matches = newsArticles.filter(article => keywords.some(keyword => keyword.length > 2 && `${article.title} ${article.description}`.toLowerCase().includes(keyword)))
    return { stock, articles: matches }
    }).sort((first, second) => (second.stock.change || 0) - (first.stock.change || 0) || second.articles.length - first.articles.length)
    const positiveMovers = ranked.filter(item => item.stock.change > 0)
    return (positiveMovers.length >= 50 ? positiveMovers : ranked).slice(0, 50)
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
      const target = bullish ? stock.swingTarget : bearish ? stock.swingStopLoss : stock.currentPrice
      const stopLoss = bullish ? stock.swingStopLoss : bearish ? stock.swingTarget : stock.support
      const upside = stock.currentPrice ? ((target - stock.currentPrice) / stock.currentPrice) * 100 : 0
      return {
        stock,
        broker,
        call,
        target: Number(target || stock.currentPrice || 0),
        stopLoss: Number(stopLoss || stock.currentPrice || 0),
        upside,
        confidence: Math.min(95, Math.max(52, Math.round((score * broker.bias) || 52))),
        rationale: call === 'BUY' ? `${stock.pattern?.type || 'Positive trend'} with ${stock.marketStructure?.trend || 'supportive structure'}` : call === 'SELL' ? `Weak momentum with ${stock.marketStructure?.trend || 'downside risk'}` : 'Mixed momentum; wait for confirmation'
      }
    }), [stocks])

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
    setTab(label === 'News' ? 'news' : label === 'Patterns' ? 'patterns' : label === 'Dividends' ? 'dividends' : label === 'Watchlist' ? 'watchlist' : 'top30')
    setMenu(false)
  }

  const exportExcel = () => {
    const workbook = XLSX.utils.book_new()
    const stockRows = items => items.map(stock => ({
      Symbol: stock.s,
      Company: stock.n,
      Sector: stock.sector || '',
      Category: stock.c || '',
      Price: stock.currentPrice || '',
      'Today Change %': stock.change || 0,
      'Technical Score': stock.technicalScore || 0,
      RSI: stock.rsi || '',
      Trend: stock.marketStructure?.trend || '',
      Pattern: stock.pattern?.type || '',
      'Pattern Direction': stock.pattern?.direction || '',
      'Intraday Target': stock.intradayTarget || '',
      'Intraday Stop Loss': stock.intradayStopLoss || '',
      'Swing Target': stock.swingTarget || '',
      'Swing Stop Loss': stock.swingStopLoss || ''
    }))
    const addSheet = (name, rows, fallback = [{ Status: 'No data available' }]) => {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows.length ? rows : fallback), name)
    }

    addSheet('Top 100', stockRows(top100))
    addSheet('Large Cap', stockRows(largeCaps))
    addSheet('Mid Cap', stockRows(midCaps))
    addSheet('Small Cap', stockRows(smallCaps))
    addSheet('Watchlist', stockRows(watchlistStocks))
    addSheet('Patterns', stockRows([...bullishPatterns, ...bearishPatterns]))
    addSheet('News Movers', newsMovers.map(({ stock, articles }) => ({
      ...stockRows([stock])[0],
      'News Matches': articles.length,
      'Latest Headline': articles[0]?.title || 'No direct headline match',
      'Headline Link': articles[0]?.link || ''
    })))
    addSheet('Broker Calls', brokerCalls.map(item => ({
      Symbol: item.stock.s,
      Company: item.stock.n,
      Broker: item.broker.name,
      'Strategy Desk': item.broker.style,
      Call: item.call,
      Price: item.stock.currentPrice || '',
      Target: item.target,
      'Stop Loss': item.stopLoss,
      'Expected Upside %': Number(item.upside.toFixed(2)),
      Horizon: item.broker.horizon,
      Confidence: item.confidence,
      Rationale: item.rationale
    })))
    addSheet('Dividends', nseDividends.map(dividend => ({
      Company: dividend.company,
      Purpose: dividend.purpose,
      'Ex-Date': dividend.exDate,
      'Record Date': dividend.recordDate,
      'Face Value': dividend.faceValue,
      Published: dividend.publishedAt,
      Source: dividend.source
    })))

    XLSX.writeFile(workbook, `stock-pulse-india-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="logo"><Sparkles size={20} /></div>
          <div><b>Stock Pulse</b><span>AI ANALYSIS</span></div>
        </div>
        <div className="market-cockpit">
          <div className="cockpit-status"><span className="live-dot" /> LIVE MARKET PULSE</div>
          <div className="cockpit-divider" />
          <div className="cockpit-stat"><strong>{stocks.length || '—'}</strong><span>stocks tracked</span></div>
          <div className="cockpit-stat"><strong>AI</strong><span>analysis online</span></div>
          <div className="cockpit-date"><span>INDIA · NSE / BSE</span><strong>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
        </div>
        <div className="top-actions">
          <button className="iconbtn"><Bell size={18} /></button>
          <button className="profile">AI</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <div className="eyebrow"><span className="live-dot" /> REAL-TIME TECHNICAL ANALYSIS</div>
            <h1>Indian Stock Market <em>AI Engine</em></h1>
            <p>Advanced technical analysis with chart patterns, indicators, market regime detection, and risk/reward scoring for 100 top stocks across Large, Mid, and Small Cap categories.</p>
          </div>
          <div className="hero-actions">
            <form className="stock-search" onSubmit={handleStockSearch}>
              <Search size={16} />
              <input
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="Search NSE/BSE symbol"
                aria-label="Search NSE or BSE stock symbol"
              />
              <button type="submit" disabled={searching}>
                {searching ? 'Analyzing...' : 'Analyze'}
              </button>
            </form>
            <button className="refresh" onClick={() => window.location.reload()}>
              <RefreshCw size={17} /> Refresh Analysis
            </button>
            <button className="export-excel" onClick={exportExcel} disabled={loading && stocks.length === 0}>
              <Download size={17} /> Download Excel
            </button>
          </div>
        </section>

        {searchError && <div className="search-error" role="alert">{searchError}</div>}

        <section className="tabs-nav">
          <button className={tab === 'top30' ? 'active' : ''} onClick={() => setTab('top30')}>
            🏆 Top 100 Opportunities
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
          <button className={tab === 'watchlist' ? 'active' : ''} onClick={() => setTab('watchlist')}>
            ⭐ Watchlist ({watchlistStocks.length})
          </button>
        </section>

        {tab !== 'dividends' && tab !== 'news' && tab !== 'brokerCalls' && tab !== 'ai' && (
          <StockSortControls sortConfig={sortConfig} onChange={setSortConfig} />
        )}

        {loading && stocks.length === 0 ? (
          <div className="loading">
            <Sparkles className="spin" size={32} />
            <div>
              <p>Analyzing stocks...</p>
              <small>Fetching live market data {stocks.length > 0 && `(${stocks.length} loaded)`}</small>
            </div>
          </div>
        ) : (
          <>
            {tab === 'top30' && (
              <section className="card analysis-section">
                <h2>🏆 TOP 100 RANKED STOCKS</h2>
                <div className="table-wrapper">
                  <table className="analysis-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Stock</th>
                        <th>Trend Chart</th>
                        <th>Price</th>
                        <th>Change %</th>
                        <th>Pattern</th>
                        <th>RSI</th>
                        <th>Trend</th>
                        <th>Volume</th>
                        <th>Score</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top100.map((stock, idx) => (
                        <tr key={stock.s} onClick={() => setSelectedStock(stock)}>
                          <td className="rank">{idx + 1}</td>
                          <td className="stock-name">
                            <strong>{stock.s}</strong>
                            <small>{stock.n}</small>
                            <div className="stock-tags">
                              <span className="category">{stock.c}</span>
                              <span className="sector">{stock.sector || 'Other'}</span>
                            </div>
                          </td>
                          <td className="screener-chart-cell">
                            {stock.chartPreview?.length > 1 ? (
                              <ResponsiveContainer width="100%" height={46}>
                                <RechartsLine data={stock.chartPreview}>
                                  <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={stock.change >= 0 ? 'var(--teal)' : 'var(--coral)'}
                                    strokeWidth={2.5}
                                    dot={false}
                                    isAnimationActive={false}
                                  />
                                </RechartsLine>
                              </ResponsiveContainer>
                            ) : (
                              <span className="chart-unavailable">N/A</span>
                            )}
                          </td>
                          <td className="price">₹{stock.currentPrice?.toFixed(2) || 'N/A'}</td>
                          <td className={stock.change >= 0 ? 'positive' : 'negative'}>
                            {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
                          </td>
                          <td className="pattern-cell">
                            {stock.pattern ? (
                              <span className={`pattern-badge ${stock.pattern.direction.toLowerCase()}`}>
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
                          <td className="row-actions-cell">
                            <button className="watch-btn" title={watchlistSymbols.includes(stock.symbol) ? 'Remove from watchlist' : 'Add to watchlist'} onClick={event => { event.stopPropagation(); toggleWatchlist(stock) }}>
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
                <h2>🥇 TOP {largeCaps.length} LARGE CAP STOCKS</h2>
                <StockGrid stocks={largeCaps} onSelect={setSelectedStock} watchlistSymbols={watchlistSymbols} onToggleWatchlist={toggleWatchlist} />
              </section>
            )}

            {tab === 'midcap' && (
              <section className="card analysis-section">
                <h2>🚀 TOP {midCaps.length} MID CAP STOCKS</h2>
                <StockGrid stocks={midCaps} onSelect={setSelectedStock} watchlistSymbols={watchlistSymbols} onToggleWatchlist={toggleWatchlist} />
              </section>
            )}

            {tab === 'smallcap' && (
              <section className="card analysis-section">
                <h2>⚡ TOP {smallCaps.length} SMALL CAP STOCKS</h2>
                <StockGrid stocks={smallCaps} onSelect={setSelectedStock} watchlistSymbols={watchlistSymbols} onToggleWatchlist={toggleWatchlist} />
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
                {watchlistStocks.length === 0 ? (
                  <div className="no-results">No stocks saved yet. Use Add to Watchlist on any stock.</div>
                ) : (
                  <StockGrid stocks={watchlistStocks} onSelect={setSelectedStock} watchlistSymbols={watchlistSymbols} onToggleWatchlist={toggleWatchlist} />
                )}
              </section>
            )}

            {tab === 'patterns' && (
              <section className="patterns-section">
                <div className="card">
                  <h2>📈 BULLISH PATTERNS ({bullishPatterns.length})</h2>
                  <PatternGrid patterns={bullishPatterns} onSelect={setSelectedStock} watchlistSymbols={watchlistSymbols} onToggleWatchlist={toggleWatchlist} />
                </div>
                <div className="card">
                  <h2>📉 BEARISH PATTERNS ({bearishPatterns.length})</h2>
                  <PatternGrid patterns={bearishPatterns} onSelect={setSelectedStock} watchlistSymbols={watchlistSymbols} onToggleWatchlist={toggleWatchlist} />
                </div>
              </section>
            )}

            {tab === 'news' && (
              <NewsMovers movers={newsMovers} loading={newsLoading} error={newsError} />
            )}

            {tab === 'brokerCalls' && (
              <BrokerCalls calls={brokerCalls} onSelect={setSelectedStock} />
            )}

            {tab === 'ai' && (
              <AIQueryPanel stocks={stocks} brokerCalls={brokerCalls} newsMovers={newsMovers} onSelect={setSelectedStock} />
            )}

            {tab === 'dividends' && (
              <DividendCalendar dividends={nseDividends} loading={dividendLoading} error={dividendError} />
            )}

            {selectedStock && <StockDetailPanel stock={selectedStock} onClose={() => setSelectedStock(null)} isWatched={watchlistSymbols.includes(selectedStock.symbol)} onToggleWatchlist={toggleWatchlist} />}
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

function StockGrid({ stocks, onSelect, watchlistSymbols, onToggleWatchlist }) {
  return (
    <div className="stock-grid">
      {stocks.map((stock, idx) => (
        <div key={stock.s} className="stock-card" onClick={() => onSelect(stock)}>
          <div className="rank-badge">#{idx + 1}</div>
          <button className="card-watch-btn" title={watchlistSymbols.includes(stock.symbol) ? 'Remove from watchlist' : 'Add to watchlist'} onClick={event => { event.stopPropagation(); onToggleWatchlist(stock) }}>
            <Star size={16} fill={watchlistSymbols.includes(stock.symbol) ? 'currentColor' : 'none'} />
          </button>
          <div className="stock-header">
            <div>
              <h3>{stock.s}</h3>
              <p>{stock.n}</p>
              <span className="card-sector">{stock.sector || 'Other'} sector</span>
            </div>
            <span className={`direction ${stock.change >= 0 ? 'bull' : 'bear'}`}>
              {stock.change >= 0 ? '↑' : '↓'} {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
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
    { value: 'technicalScore', label: 'Technical Score' },
    { value: 'change', label: 'Daily Change' },
    { value: 'currentPrice', label: 'Price' },
    { value: 'rsi', label: 'RSI' },
    { value: 'volume', label: 'Volume' },
    { value: 'name', label: 'Company Name' }
  ]

  return (
    <div className="stock-sort-controls">
      <span>Sort stocks by</span>
      <select value={sortConfig.key} onChange={event => onChange({ ...sortConfig, key: event.target.value })} aria-label="Sort stocks by">
        {sortOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <button onClick={() => onChange({ ...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
        {sortConfig.direction === 'asc' ? '↑ Ascending' : '↓ Descending'}
      </button>
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
      return { text: movers.length ? `The most relevant news-linked movers are ${movers.map(item => `${item.stock.s} (${item.articles.length} headline match${item.articles.length === 1 ? '' : 'es'})`).join(', ')}.` : 'No direct stock headline matches are available yet. I can still show today\'s largest percentage movers.', stocks: movers.map(item => item.stock) }
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
              <tr><th>Rank</th><th>Stock</th><th>Broker desk</th><th>Call</th><th>Price</th><th>Target</th><th>Stop-loss</th><th>Upside</th><th>Horizon</th><th>Confidence</th><th>Details</th></tr>
            </thead>
            <tbody>
              {calls.map((item, index) => (
                <tr key={`${item.stock.symbol}-${item.broker.name}`} onClick={() => onSelect(item.stock)}>
                  <td className="rank">{index + 1}</td>
                  <td className="stock-name"><strong>{item.stock.s}</strong><small>{item.stock.n} | {item.stock.sector || 'Other'}</small></td>
                  <td><strong>{item.broker.name}</strong><small className="broker-style">{item.broker.style}</small></td>
                  <td><span className={`broker-call ${item.call.toLowerCase()}`}>{item.call}</span></td>
                  <td>₹{item.stock.currentPrice?.toFixed(2)}</td>
                  <td className="positive">₹{item.target.toFixed(2)}</td>
                  <td className="negative">₹{item.stopLoss.toFixed(2)}</td>
                  <td className={item.upside >= 0 ? 'positive' : 'negative'}>{item.upside >= 0 ? '+' : ''}{item.upside.toFixed(1)}%</td>
                  <td>{item.broker.horizon}</td>
                  <td><span className="confidence-meter"><i style={{ width: `${item.confidence}%` }} />{item.confidence}%</span></td>
                  <td><button className="detail-btn" onClick={event => { event.stopPropagation(); onSelect(item.stock) }}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function NewsMovers({ movers, loading, error }) {
  return (
    <section className="card analysis-section news-movers">
      <div className="dividend-heading">
        <div>
          <h2>NEWS MOVERS ({movers.length})</h2>
          <p>Stocks ranked by today's market headlines and positive price movement.</p>
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
              <tr><th>Rank</th><th>Stock</th><th>Today</th><th>News</th><th>Latest headline</th><th>Action</th></tr>
            </thead>
            <tbody>
              {movers.map(({ stock, articles }, index) => (
                <tr key={stock.symbol}>
                  <td className="rank">{index + 1}</td>
                  <td className="stock-name"><strong>{stock.s}</strong><small>{stock.n} | {stock.sector || 'Other'}</small></td>
                  <td className={stock.change >= 0 ? 'positive' : 'negative'}>{stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%</td>
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
            <button className="pattern-watch-btn" title={watchlistSymbols.includes(stock.symbol) ? 'Remove from watchlist' : 'Add to watchlist'} onClick={event => { event.stopPropagation(); onToggleWatchlist(stock) }}>
              <Star size={15} fill={watchlistSymbols.includes(stock.symbol) ? 'currentColor' : 'none'} />
            </button>
            <div className="pattern-stock">
              <strong>{stock.s}</strong>
              <span>{stock.n}</span>
              <small className="pattern-sector">{stock.sector || 'Other'} sector</small>
            </div>
            <div className="pattern-info-row">
              <span className={`pattern-type ${stock.pattern.direction.toLowerCase()}`}>
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

function StockDetailPanel({ stock, onClose, isWatched, onToggleWatchlist }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('year')
  const [chartData, setChartData] = useState(stock.chart || [])
  const [chartLoading, setChartLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const timeframe = CHART_TIMEFRAMES[selectedTimeframe]

    if (selectedTimeframe === 'year' && stock.chart?.length > 1) {
      setChartData(stock.chart)
      setChartLoading(false)
      return undefined
    }

    const loadChart = async () => {
      setChartLoading(true)
      const data = await fetchHistoricalData(stock.symbol, timeframe.range, timeframe.interval)
      if (!cancelled) {
        const nextChart = data?.closes?.map((value, index) => ({
          name: data.timestamps[index] ? new Date(data.timestamps[index] * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '',
          value: Number(Number(value).toFixed(2))
        })) || []
        setChartData(nextChart)
        setChartLoading(false)
      }
    }

    loadChart()
    return () => { cancelled = true }
  }, [selectedTimeframe, stock.symbol, stock.chart])

  return (
    <div className="detail-panel">
      <div className="panel-header">
        <div>
          <h2>{stock.s} - {stock.n}</h2>
          <p>{stock.c} | {stock.sector}</p>
        </div>
        <div className="panel-actions">
          <button className="panel-watch-btn" onClick={() => onToggleWatchlist(stock)}>
            <Star size={16} fill={isWatched ? 'currentColor' : 'none'} />
            {isWatched ? 'Watching' : 'Add to Watchlist'}
          </button>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>
      </div>

      <div className="panel-content">
        <div className="price-section">
          <div className="current-price">
            <span>Current Price</span>
            <strong>₹{stock.currentPrice?.toFixed(2)}</strong>
            <span className={stock.change >= 0 ? 'positive' : 'negative'}>
              {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="detail-chart">
          <div className="detail-chart-header">
            <h3>Recent Price Trend</h3>
            <span>{CHART_TIMEFRAMES[selectedTimeframe].detail}</span>
          </div>
          <div className="chart-timeframes" role="group" aria-label="Chart timeframe">
            {Object.entries(CHART_TIMEFRAMES).map(([key, timeframe]) => (
              <button key={key} className={selectedTimeframe === key ? 'active' : ''} onClick={() => setSelectedTimeframe(key)}>
                {timeframe.label}
              </button>
            ))}
          </div>
          {chartLoading ? (
            <div className="detail-chart-empty">Loading chart...</div>
          ) : chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="detailPriceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--blue)" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="var(--teal)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis domain={['dataMin', 'dataMax']} hide />
                <Tooltip
                  formatter={value => [`₹${Number(value).toFixed(2)}`, 'Price']}
                  labelFormatter={() => ''}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e1e6f0', fontSize: 11 }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--blue)" strokeWidth={2.5} fill="url(#detailPriceFill)" dot={false} activeDot={{ r: 4, fill: 'var(--teal)' }} />
              </AreaChart>
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
            <label>MACD</label>
            <strong>{stock.macd?.toFixed(4)}</strong>
            <small>{stock.macd > stock.signal ? 'Bullish' : 'Bearish'}</small>
          </div>
          <div className="indicator-box">
            <label>ADX</label>
            <strong>{stock.adx?.toFixed(2)}</strong>
            <small>{stock.adx > 25 ? 'Strong Trend' : 'Weak Trend'}</small>
          </div>
          <div className="indicator-box">
            <label>Volume RVOL</label>
            <strong>{stock.volumeAnalysis?.rvol?.toFixed(2)}x</strong>
            <small>{stock.volumeAnalysis?.trendVolume}</small>
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
            <span>Intraday Target</span>
            <strong>₹{stock.intradayTarget?.toFixed(2)}</strong>
          </div>
          <div className="level">
            <span>Intraday SL</span>
            <strong>₹{stock.intradayStopLoss?.toFixed(2)}</strong>
          </div>
          <div className="level">
            <span>Swing Target</span>
            <strong>₹{stock.swingTarget?.toFixed(2)}</strong>
          </div>
          <div className="level">
            <span>Swing SL</span>
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
            <div className={`pattern-info-full ${stock.pattern.direction.toLowerCase()}`}>
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
          <a href={`https://www.tradingview.com/chart/?symbol=NSE:${stock.s}`} target="_blank" rel="noreferrer">
            <LineChart size={16} /> TradingView
          </a>
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
