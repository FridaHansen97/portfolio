import SwiftUI

@main
struct ArtAppApp: App {
    @State private var artworkRepository: any ArtworkRepositoryProtocol = ArtworkRepository()
    
    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(\.artworkRepository, artworkRepository)
        }
    }
}
