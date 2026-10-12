// swift-tools-version:5.10
import PackageDescription

// RoligCore = all logic, Foundation-only, so it builds and tests on macOS AND Linux CI.
// App/ = thin SwiftUI shell, built only by Xcode (iOS 17+).
let package = Package(
    name: "RoligCore",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [.library(name: "RoligCore", targets: ["RoligCore"])],
    targets: [
        .target(name: "RoligCore", swiftSettings: [.enableExperimentalFeature("StrictConcurrency")]),
        .testTarget(name: "RoligCoreTests", dependencies: ["RoligCore"]),
    ]
)
