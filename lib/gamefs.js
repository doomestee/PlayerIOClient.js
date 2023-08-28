/**
 * The GameFS service. This class is used to get an absolute URL for assets you have stored in GameFS.
 */
module.exports = class GameFS {
    constructor(gameId, redirectMap) {
        this.maps = {};
        this.gameId = gameId;

		if (typeof(redirectMap) == 'string' && redirectMap.length > 0){
			let parts = (redirectMap||"").split("|");	
			if( parts.length >= 1 ){
				this.maps[this.gameId.toLowerCase()] = {}
				for(var i=0;i!=parts.length;i++){
					var part = parts[i];
					if(part =="alltoredirect" || part == "cdnmap"){
						this.maps.baseUrl = parts[i+1];
					}else if( part == "alltoredirectsecure" || part == "cdnmapsecure" ){
						this.maps.secureBaseUrl = parts[i+1];
					}else{
						this.maps["."+part] = parts[i+1];
					}
				}
			}
		}
    }

    /**
     * Converts a GameFS path (like '/mygame.swf') into a full url, that can be downloaded over the internet.
     * Important! Do not save or otherwise persist (bigdb, cookies, etc) the returned url, since the url will change over time.
     * @param {string} path The path of the file in the GameFS, including the initial slash. Examples: '/mygame.swf' or '/characters/bob.jpg'
     * @param {boolean} secure If true, this method returns a secure (https) url.
     * @return {string} An url that can be used to download the resource over the internet.
     */
    getUrl(path, secure) {
        if(!path[0] == "/") {
            throw Error("The path given to getUrl must start with a slash, like: '/myfile.swf' or '/folder/file.jpg'");
        }

        let map = this.maps[this.gameId];
        if( map ){
            return (secure ? map.secureBaseUrl : map.baseUrl) + (map["."+path] || path);
        }else{
            return (secure ? "https" : "http") + "://r.playerio.com/r/" + this.gameId + path;
        }
    }
}