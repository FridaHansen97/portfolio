import SwiftUI

extension EnvironmentValues {
    @Entry var artworkRepository: any ArtworkRepositoryProtocol = ArtworkRepository()
}
