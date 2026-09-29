import Foundation
import SwiftData

@Model
final class FavoriteArtwork {
    @Attribute(.unique) var artworkId: Int
    var title: String?
    var creationDate: String?
    var creatorDescription: String?
    var imageURLString: String?
    var technique: String?
    var artworkDescription: String?
    var department: String?
    var dateAdded: Date
    
    init(artwork: Artwork) {
        artworkId = artwork.id
        title = artwork.title
        creationDate = artwork.creationDate
        creatorDescription = artwork.creators?.first?.description
        imageURLString = artwork.images?.web?.url
        technique = artwork.technique
        artworkDescription = artwork.description
        department = artwork.department
        dateAdded = .now
    }
    
    var artwork : Artwork {
        Artwork(id: artworkId,
                title: title,
                creationDate: creationDate,
                creators: creatorDescription.map { [Creator(description: $0)] },
                images: imageURLString.map { ArtworkImages(web: ImageAsset(url: $0)) },
                technique: technique,
                description: artworkDescription,
                department: department
        )
    }
}
