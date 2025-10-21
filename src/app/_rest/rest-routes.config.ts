const API = 'api';
const USER = 'user';
const AUTH = 'auth';
const PORTALUSERS = 'PortalUsers';
const ORDERS = 'Orders';
const BALANCES = 'Balances';
const CASHMOVEMENTS = 'CashMovements';
const CUSTOMER = 'client';
const DOCUMENT = 'settings';
const DOCUMENTS = 'documents';
const SETTINGS = 'settings';
const CUSTOMERS = 'clients';
const CATEGORIES = 'category';
const MODIFIERS = 'modifier';
const PRODUCT = 'product';
const PRODUCTS = 'products'
const TAXES = 'Taxes';
const VERIFACTU = 'api/verifactu/';
const REPRESENTATION_DOCUMENT_DOWNLOAD = `${VERIFACTU}representation-document/download`;


/**
 * Configuración de rutas REST utilizadas en la aplicación.
 * Contiene rutas base y rutas específicas para autenticación, usuarios,
 * ventas, cierres de caja, clientes, productos, impuestos y movimientos de caja.
 */
export const RestRoutes = {
  USER: `${API}/${USER}`,
  AUTH: `${API}/${AUTH}`,
  AUTH_PORTALUSERS: `${API}/${AUTH}/portalusers`,
  AUTH_PORTALUSERS_PWD_RECOVER: `${API}/${AUTH}/portalusers/password/recover`,
  AUTH_PORTALUSERS_PWD_RESET: `${API}/${AUTH}/portalusers/password/reset`,
  AUTH_PORTALUSERS_PWD_PROPERTIES: `${API}/${AUTH}/portalusers/password/properties`,
  AUTH_PORTALUSERS_LOGIN: `${API}/${AUTH}/portalusers/login`,
  PORTALUSERS_COMMERCES: `${API}/${PORTALUSERS}/commerces`,
  PORTALUSERS_TERMINALS: `${API}/${PORTALUSERS}/terminals`,

  ORDERS: `${API}/${ORDERS}/`,
  ORDERS_INFO: `${API}/${ORDERS}`,
  ORDERS_AGGREGATE: `${API}/${ORDERS}/aggregate`,
  OPERATIONS_REPORT: `${API}/${ORDERS}/generate/operations-report?fromDate=`,

  BALANCES: `${API}/${BALANCES}/`,
  BALANCES_INFO: `${API}/${BALANCES}?size=`,
  BALANCES_ARQUEO_X: `${API}/${BALANCES}/generate/arqueo-x?fromDate=`,

  CASH_MOVEMENTS_AGGREGATE: `${API}/${CASHMOVEMENTS}/aggregate`,

  CUSTOMER: `${CUSTOMER}`,
  CUSTOMERS: `${CUSTOMERS}`,
  CUSTOMERS_INFO: `${CUSTOMERS}`,

  DOCUMENT: `${DOCUMENT}`,
  DOCUMENTS: `${DOCUMENTS}`,
  DOCUMENTS_INFO: `${DOCUMENTS}`,

  PRODUCT: `${PRODUCT}`,
  PRODUCTS: `${PRODUCTS}`,
  PRODUCTS_INFO: `${PRODUCTS}`,

  CATEGORIES: `${CATEGORIES}`,

  MODIFIERS: `${MODIFIERS}`,

  COMMERCE: `/settings/commerce`,

  TAXES: `${API}/${TAXES}/`,
  TAXES_INFO: `${API}/${TAXES}?size=`,

  PARAM_OFFSET: `&offset=0`,
  PARAM_QS: `&qs={"and":`,
  PARAM_TODATE: `&toDate=`,
  PARAM_TERMINALNUMBER: `&terminalNumber=`,
  PARAM_COMMERCEID: `&CommerceId=`,

  VERIFACTU_REPRESENTATION_DOCUMENT_DOWNLOAD: `${REPRESENTATION_DOCUMENT_DOWNLOAD}`,


  SETTINGS_COMMERCE: `${SETTINGS}/commerce?commerceId=`,
  TAXES_COMMERCE: `tax/all`,
};
