const API = 'api';

export const RestRoutes = {
  CONTACTS: `${API}/Contacts`,
  CONTACTS_GETSH: `${API}/Contacts/GetSH/{page}`,
  LANGUAGES: `${API}/Languages`,
  USER: `${API}/user`,
  AUTH: `${API}/auth`, // WS controller para peticiones auth
  ALERTS: `${API}/Alerts`,
  ALERTS_SUMMARY: `${API}/Alerts/summaries`,
  ALERTS_SUMMARY_SEARCH: `${API}/Alerts/search/summary/page`,
  ALERTS_SUMMARY_PAGINATED: `${API}/Alerts/summaries/page`,
  ACTIONCONFIGURATIONTEMPLATES_GETSH: `${API}/ActionConfigurationTemplates/Search`,
  ACTIONCONFIGURATIONTEMPLATES_DELETED: `${API}/ActionConfigurationTemplates/{actionConfigurationTemplateID}/{lastUpdateBy}`,
  ACTIONCONFIGURATIONTEMPLATES_GETONE: `${API}/ActionConfigurationTemplates/{actionConfigurationTemplateID}`,
  ACTIONCONFIGURATIONTEMPLATES_ADDUPDATE: `${API}/ActionConfigurationTemplates/`,
  ALERTCONFIGURATION_GETSH_PAGINATED: `${API}/AlertConfigurations/{portalId}/search/page/{page}`,
  ALERTCONFIGURATION_GETONE: `${API}/AlertConfigurations/{alertConfigurationGuid}`,
  ALERTCONFIGURATION_ADDUPDATECONFIGURATIONANDVERSIONS: `${API}/AlertConfigurations/`,
  ALERTCONFIGURATION_ADDUPDATE: `${API}/AlertConfigurations/AddUpdate`,
  ALERTCONFIGURATIONVERSIONS_GETONE: `${API}/AlertsConfigurationVersions/{alertConfigurationVersionGUID}`,
  ALERTCONFIGURATIONVERSIONS_GETSH: `${API}/AlertsConfigurationVersions/Search/`,
  ALERT_CONFIGURATIONS_PROPERTIES: `${API}/AlertConfigurations/properties`,
  ALERT_CONFIGURATIONS_UPDATE_FALSE_POSITIVE: `${API}/AlertConfigurations/update/alert/state/false-positive`,
  ALERT_CONFIGURATIONS_UPDATE_OK: `${API}/AlertConfigurations/update/alert/state/ok`,
}
