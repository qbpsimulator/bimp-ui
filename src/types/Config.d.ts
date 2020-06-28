export interface Config {
    protocol: string
    host: string
    url: string
    basicAuth?: {
        username: string
        password: string
    }
    jwtAuth?: {
        token?: string
    }
    linkPrefix: string
    errorStackApiKey: string
}
