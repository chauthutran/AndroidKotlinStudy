More details in this link : https://docs.google.com/document/d/10T7GFaAFu7e6-TcDaQujry7myDp0940Oskyv7wXR60Y

#### https://wjw465150.gitbooks.io/keycloak-documentation/content/securing_apps/topics/oidc/javascript-adapter.html


- How to use keycloak offline token
    + Offline tokens can have very long living period (keycloak default is 1 month – but it can be much more)
    + It is up to the customer to manage offline token (store in a database)
    + A user needs to have offline security role to manipulate offline tokens
    + You needs to specify scope=offline_accessin the OIDC requestto get an offline token
    offline token can also be manipulated using direct authentication flow

- Refresh token is subject to SSO Session Idle timeout (30mn -default) and SSO Session Max lifespan (10hours-default) whereas offline token never expires.

The refresh token will always be returned along with the access token, so we can get a new access token without the user having to log in again.

A refresh token will always have an expiration time, the default of Keycloak is 30 minutes! Every time a new access token is issued, the refresh token will be re-issued, and you can use the latest one for a longer expiration time.

We can use a refresh token to request the access token multiple times. However, you can limit the number of times a refresh token can be used (  by going to the Tokens tab, Refresh tokens section of Realm Settings, configuring the Revoke Refresh Token field. If you turn on this field, you can configure how many times a refresh token is reused )

    + Set Offline Session Max Limited in 
        +++ Offline Session Max Limited : ON
        +++ Offline Session Max : 60 days ( default )
