// include Fake lib
#r @"packages\FAKE\tools\FakeLib.dll"
open System
open Fake
open Fake.AssemblyInfoFile
open Fake.OctoTools
open Fake.REST

let nugetPath = "nuget/NuGet.exe"


// Directories
let buildDir  = @".\build\"
let packagesDir = @".\packages"

let runJSTest=true
let runNUnitTest=true

// package version info
let version =
  match buildServer with
  | Jenkins -> buildVersion
  | _ -> "0.1.0.0-local"


// nuget publish option
let nugetpublish =
  match buildServer with
  | Jenkins -> true
  | _ -> false

// Targets
Target "Clean" (fun _ ->
    CleanDirs [buildDir]
)

Target "RunBuild" (fun _ ->
    CleanDirs [@".\dist"]

    let preRunBuild= Shell.Exec("cmd", "/C npm install", "./")
    if preRunBuild <> 0 then failwith "Failed to install npm packages for InstiClient"
    let runBuild = Shell.Exec("cmd","/C npm run ng -- build","./")
    if runBuild <> 0 then failwith "Failed to run ng build"
)


Target "JSTest" (fun _ -> 
    let errorCode = Shell.Exec("cmd", "/C echo TODO: add js tests", ".")
    if errorCode <> 0 then failwith "Javascript tests failed!"
)


//Code Created By IBS
let packingDir = @"./nugetPackages/"
let outputDir =  packingDir @@ "NugetLibrary"

let CreateSlimPackage projectname projectfolder nuspecfile =  
    NuGet (fun p ->
     {p with
         Project = projectname
         Authors = ["AlgoMerchant"]
         Description = "This is "+projectname+" nuget package"         
         Version = version
         OutputPath = buildDir         
         ToolPath = nugetPath
         WorkingDir = projectfolder
         })
         nuspecfile

Target "CompileApp" (fun _ ->            
    CreateSlimPackage "OptionPi" @"dist\options-web" @"dist\options-web\template.nuspec" 
)


// Create the release (without deployment yet) using OctoPack
Target "CreateRelease" (fun _->    
    let server = { Server = "https://octopus.algomerchant.com"; ApiKey = "API-HRA79BCO1JO6WM1DLXG2DTK5SAS" }    
    let octoToolsPath = packagesDir @@ "OctopusTools.2.6.1.52" 
    let projects = ["OptionPi"]

    for project in projects do
        NuGetPublish (fun p -> 
            { p with
                OutputPath = buildDir
                ToolPath = nugetPath
                Project = project
                Version = version
                PublishUrl = server.Server + @"/nuget/packages"
                AccessKey = server.ApiKey
            })
    
        let release = { releaseOptions with 
                            Project = project
                            Version = version
                            Packages = [project + ":" + version]
                            IgnoreExisting = true                                                
                             }
    
        Octo (fun octoParams ->
            { octoParams with
                ToolPath = octoToolsPath
                Server   = server
                Command  = CreateRelease (release, None) }
        )
    
)


// Dependencies

"RunBuild"
      =?> ("JSTest",runJSTest)
      ==> "Clean"
      ==> "CompileApp" 
      ==> "CreateRelease"       


// start build
RunTargetOrDefault "CompileApp"
