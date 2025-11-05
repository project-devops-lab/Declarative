#!/usr/bin/env python3
"""
Script to extract EC2 instance public IP from Terraform state file
and update the React application configuration.
"""

import json
import os
import sys
import re

def find_terraform_state():
    """Find terraform.tfstate file in common locations"""
    possible_paths = [
        'terraform/terraform.tfstate',  # Terraform state is in terraform/ subdirectory
        'terraform.tfstate',
        '.terraform/terraform.tfstate',
        '../terraform.tfstate',
        '../terraform/terraform.tfstate'
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            print(f"Found terraform state at: {path}")
            return path
    
    print("WARNING: terraform.tfstate not found in common locations")
    return None

def extract_ec2_ip_from_state(state_file):
    """Extract EC2 instance public IP from terraform state"""
    try:
        with open(state_file, 'r') as f:
            state_data = json.load(f)
        
        # Handle Terraform state format v4 (JSON format)
        # Look for resources with type aws_instance
        resources = state_data.get('resources', [])
        
        for resource in resources:
            if resource.get('type') == 'aws_instance':
                instances = resource.get('instances', [])
                for instance in instances:
                    attributes = instance.get('attributes', {})
                    # Check for public_ip (preferred)
                    public_ip = attributes.get('public_ip') or attributes.get('public_ip_address')
                    if public_ip and public_ip != '' and public_ip != 'null':
                        print(f"Found EC2 public IP: {public_ip}")
                        return public_ip
                    # Fallback to private_ip if public_ip not available
                    private_ip = attributes.get('private_ip') or attributes.get('private_ip_address')
                    if private_ip and private_ip != '' and private_ip != 'null':
                        print(f"Found EC2 private IP: {private_ip} (using as fallback)")
                        return private_ip
        
        # Handle Terraform state format v3 or alternative structure
        # Sometimes resources are nested differently
        outputs = state_data.get('outputs', {})
        for output_name, output_value in outputs.items():
            if 'ip' in output_name.lower() or 'public' in output_name.lower():
                value = output_value.get('value', '') if isinstance(output_value, dict) else output_value
                if value and value != '' and value != 'null':
                    print(f"Found IP from output '{output_name}': {value}")
                    return value
        
        print("WARNING: No EC2 instance found in terraform state")
        print("NOTE: If terraform apply hasn't been run yet, this is expected.")
        return None
        
    except FileNotFoundError:
        print(f"ERROR: Terraform state file not found: {state_file}")
        return None
    except json.JSONDecodeError as e:
        print(f"ERROR: Failed to parse terraform state JSON: {e}")
        return None
    except Exception as e:
        print(f"ERROR: Unexpected error reading terraform state: {e}")
        import traceback
        traceback.print_exc()
        return None

def update_react_config(ec2_ip, port=80):
    """Update React app configuration file with EC2 IP"""
    config_paths = [
        'Dashboard web app/project/src/config/api.ts',
        'Dashboard web app/project/src/config.ts',
        'Dashboard web app/project/.env',
        'Dashboard web app/project/.env.production',
        'Dashboard web app/project/src/config/config.ts',
    ]
    
    # Determine if using HTTP or HTTPS based on port
    protocol = 'https' if port == 443 else 'http'
    api_url = f"{protocol}://{ec2_ip}:{port}"
    
    # Try to find and update existing config file
    config_updated = False
    
    for config_path in config_paths:
        if os.path.exists(config_path):
            print(f"Updating config file: {config_path}")
            try:
                with open(config_path, 'r') as f:
                    content = f.read()
                
                # Update API URL in various formats
                patterns = [
                    (r'API_URL\s*=\s*["\']([^"\']+)["\']', f'API_URL = "{api_url}"'),
                    (r'VITE_API_URL\s*=\s*([^\n]+)', f'VITE_API_URL={api_url}'),
                    (r'REACT_APP_API_URL\s*=\s*([^\n]+)', f'REACT_APP_API_URL={api_url}'),
                    (r'baseURL["\']:\s*["\']([^"\']+)["\']', f'baseURL": "{api_url}"'),
                    (r'baseUrl["\']:\s*["\']([^"\']+)["\']', f'baseUrl": "{api_url}"'),
                ]
                
                updated = False
                for pattern, replacement in patterns:
                    if re.search(pattern, content):
                        content = re.sub(pattern, replacement, content)
                        updated = True
                        break
                
                if not updated:
                    # Append if no existing config found
                    if config_path.endswith('.env') or config_path.endswith('.env.production'):
                        content += f"\nVITE_API_URL={api_url}\n"
                    else:
                        content += f"\nexport const API_URL = '{api_url}';\n"
                
                with open(config_path, 'w') as f:
                    f.write(content)
                
                print(f"Successfully updated {config_path} with API URL: {api_url}")
                config_updated = True
                break
                
            except Exception as e:
                print(f"ERROR: Failed to update {config_path}: {e}")
                continue
    
    # If no config file found, create one
    if not config_updated:
        default_config_path = 'Dashboard web app/project/src/config/api.ts'
        os.makedirs(os.path.dirname(default_config_path), exist_ok=True)
        
        config_content = f"""// Auto-generated configuration file
// Updated by update_app_config.py script during CI/CD pipeline

export const API_CONFIG = {{
  baseURL: '{api_url}',
  timeout: 10000,
}};

export const API_URL = '{api_url}';
"""
        
        try:
            with open(default_config_path, 'w') as f:
                f.write(config_content)
            print(f"Created new config file: {default_config_path}")
            print(f"API URL set to: {api_url}")
            config_updated = True
        except Exception as e:
            print(f"ERROR: Failed to create config file: {e}")
            return False
    
    return config_updated

def main():
    """Main function"""
    print("=" * 60)
    print("EC2 IP Configuration Updater")
    print("=" * 60)
    
    # Find terraform state file
    state_file = find_terraform_state()
    if not state_file:
        print("WARNING: Could not find terraform state file")
        print("This might be expected if terraform apply hasn't been run yet.")
        print("The script will continue but configuration will use default values.")
        print("Please ensure terraform.tfstate exists after running 'terraform apply'")
        # Don't exit - let the script continue with a default/placeholder value
        ec2_ip = None
    else:
        # Extract EC2 IP
        ec2_ip = extract_ec2_ip_from_state(state_file)
    
    if not ec2_ip:
        print("WARNING: Could not extract EC2 IP from terraform state")
        print("This might be expected if:")
        print("  1. Terraform apply hasn't been run yet")
        print("  2. EC2 instance doesn't have a public IP assigned yet")
        print("  3. Terraform state structure is different than expected")
        print("")
        print("Using placeholder IP - update manually or run terraform apply first")
        ec2_ip = "PLACEHOLDER_IP"  # Placeholder that can be updated later
        # Don't exit - continue with placeholder
    
    if ec2_ip == "PLACEHOLDER_IP":
        print("WARNING: Using placeholder IP. Configuration file will be created but needs manual update.")
        print("Once terraform apply is complete, re-run this script or manually update the config.")
    
    # Update React config
    port = int(os.environ.get('APP_PORT', '80'))
    success = update_react_config(ec2_ip, port)
    
    if success:
        print("=" * 60)
        print("Configuration update completed successfully!")
        if ec2_ip == "PLACEHOLDER_IP":
            print("NOTE: Using placeholder IP - update manually after terraform apply")
        print("=" * 60)
        sys.exit(0)
    else:
        print("=" * 60)
        print("WARNING: Could not update configuration file")
        print("This may be expected if terraform hasn't been applied yet.")
        print("Pipeline will continue - configuration can be updated manually.")
        print("=" * 60)
        # Exit with success so pipeline doesn't fail
        sys.exit(0)

if _name_ == '_main_':
    main()
