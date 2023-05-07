function KeycloakUtils() {};

KeycloakUtils.isExpired = function( tokenInfo )
{
    const parsedTokenData = JSON.parse( tokenInfo );
    const leftSeconds = parsedTokenData.exp - new Date().getTime() / 1000;
	return (leftSeconds <= 0) // Token Expired
}