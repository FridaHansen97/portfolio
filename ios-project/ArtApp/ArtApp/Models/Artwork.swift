import Foundation

struct ArtworkResponse: Decodable {
    let data: [Artwork]
}

struct Artwork: Decodable, Identifiable, Hashable {
    let id: Int
    let title: String?
    let creationDate: String?
    let creators: [Creator]?
    let images: ArtworkImages?
}

struct Creator: Decodable, Hashable {
    let description: String?
}

struct ArtworkImages: Decodable, Hashable {
    let web: ImageAsset?
}

struct ImageAsset: Decodable, Hashable {
    let url: String
}

extension Artwork {
    var artistName: String {
        guard let description = creators?.first?.description else {
            return "Unknown artist"
        }
        return description.components(separatedBy: " (").first ?? description
    }

    var imageURL: URL? {
        guard let urlString = images?.web?.url else { return nil }
        return URL(string: urlString)
    }
}
