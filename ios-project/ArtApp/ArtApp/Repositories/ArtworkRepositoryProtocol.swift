protocol ArtworkRepositoryProtocol: AnyObject {
    var artworks: [Artwork] { get }
    func fetchArtworks(query: String) async throws
}
