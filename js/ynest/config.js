Configuration.apiUrl = 'https://api.foodtalk.vn';
Configuration.ynestMerchantId = 'fd5b50d1-2d0c-41bf-bd2b-8efbfd1c7f7b';
// Configuration.ynestMerchantId = '38fa3d75-707a-4bed-a295-da12a44cdb67';
Configuration.imageRoot = 'https://static.foodizzi.com';
Configuration.inventoryId  = 'ee483cf3-ffa9-40d3-be5f-5b091e73ca00';
Configuration.hostElasticSearch = 'es.foodizzi.com';
Configuration.userElasticSearch = 'amara';
Configuration.passwordElasticSearch = 'dSPKMcdQkG5X97b';
Configuration.protocolElasticSearch = 'https';
Configuration.portElasticSearch = '443';
var client = elasticsearch.Client({
	host:
	[
	{
		host: Configuration.hostElasticSearch,
		auth: Configuration.userElasticSearch + ':' + Configuration.passwordElasticSearch,
		protocol: Configuration.protocolElasticSearch,
		port: Configuration.portElasticSearch
	}
	]
});