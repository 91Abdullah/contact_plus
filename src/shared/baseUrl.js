// export const baseUrl = 'http://localhost/contactplusapi/public';
export const baseUrl = 'https://api.contact-plus.com/contactplusapi/public'
// export const baseUrl = 'https://api.contactplus.com'
export const cookieRoute = '/sanctum/csrf-cookie'
export const login = '/login';
export const register = '/register';
export const logout = '/logout';

export const agentLogin = '/api/agent/login'
export const agentLogout = '/api/agent/logout'
export const agentNotReady = '/api/agent/pause'
export const agentReady = '/api/agent/unpause'
export const agentStatus = '/api/agent/status'
export const agentChannel = '/api/agent/channel'
export const isAgentReady = '/api/agent/is-ready'
export const submitWorkcode = '/api/agent/workcode'

export const user = '/api/get-user'
export const getSystem = '/api/system-setting'
export const getReason = '/api/pause-reason'
export const getWorkcodes = '/api/workCode'

export const submitOutboudWorkCode = '/api/outboundWorkCode'