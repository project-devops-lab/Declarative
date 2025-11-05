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
        'terraform/terraform.tfstate',
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
        
        resources = state_data.get('resources', [])
        
        for resource in resources:
            if resource.get('type') == 'aws_instance':
                instances = resource.get('instances', [])
                for instance in instances:
                    attributes = instance.get('attributes', {})
                    public_ip = attributes.get('public_ip') or attributes.get('public_ip_address')
                    if public_ip and public_ip != '' and public_ip != 'null':
                        print(f"Found EC2 public IP: {public_ip}")
                        return public_ip
                    private_ip = attributes.get('private_ip') or attributes.get('private_ip_address')
                    if private_ip and private_ip != '' and private_ip != 'null':
                        print(f"Found EC2 private IP: {private_ip} (using as fallback)")
                        return private_ip
        
        outputs = state_data.get('outputs', {})
        for output_name, output_value in outputs.items():
            if 'ip' in output_name.lower() or 'public' in output_name.lower():
                value = output_value.get('value', '') if isinstance(output_value, dict) else output_value
                if value and value != '' and value != 'null':
                    print(f"Found IP from output '{output_name}': {value}")
                    return value
        
        print("WARNING: No EC2 instance found in terraform state")
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
    config_path = 'Dashboard web app/project/src/config/api.ts'
    
    protocol = 'https' if port == 443 else 'http'
    api_url = f"{protocol}://{ec2_ip}:{port}"
    
    try:
        if os.path.exists(config_path):
            print(f"Updating config file: {config_path}")
            with open(config_path, 'r') as f:
                content = f.read()
            
            # Remove duplicate API_URL exports
            lines = content.split('\n')
            cleaned_lines = []
            api_url_found = False
            
            for line in lines:
                # Skip duplicate API_URL exports
                if 'export const API_URL' in line:
                    if not api_url_found:
                        cleaned_lines.append(line)
                        api_url_found = True
                    continue
                cleaned_lines.append(line)
            
            # Replace or add API_URL export
            new_content = '\n'.join(cleaned_lines)
            
            # Replace existing API_URL if found
            if re.search(r'export const API_URL', new_content):
                new_content = re.sub(
                    r'export const API_URL\s*=\s*[^;]+;',
                    f'export const API_URL = \'{api_url}\';',
                    new_content
                )
            else:
                # Add new API_URL export at the end
                new_content += f"\n\nexport const API_URL = '{api_url}';"
            
            # Update API_CONFIG baseURL if it exists
            new_content = re.sub(
                r"(baseURL:\s*['\"])([^'\"]+)(['\"])",
                f"\\1{api_url}\\3",
                new_content
            )
            
            with open(config_path, 'w') as f:
                f.write(new_content)
            
            print(f"Successfully updated {config_path} with API URL: {api_url}")
            return True
        else:
            # Create new config file
            os.makedirs(os.path.dirname(config_path), exist_ok=True)
            
            config_content = f"""// Auto-generated configuration file
// Updated by update_app_config.py script during CI/CD pipeline

export const API_CONFIG = {{
  baseURL: '{api_url}',
  timeout: 10000,
}};

export const API_URL = '{api_url}';
"""
            
            with open(config_path, 'w') as f:
                f.write(config_content)
            print(f"Created new config file: {config_path}")
            print(f"API URL set to: {api_url}")
            return True
            
    except Exception as e:
        print(f"ERROR: Failed to update config file: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main function"""
    print("=" * 60)
    print("EC2 IP Configuration Updater")
    print("=" * 60)
    
    state_file = find_terraform_state()
    if not state_file:
        print("WARNING: Could not find terraform state file")
        ec2_ip = None
    else:
        ec2_ip = extract_ec2_ip_from_state(state_file)
    
    if not ec2_ip:
        print("WARNING: Could not extract EC2 IP from terraform state")
        print("Using placeholder IP - update manually or run terraform apply first")
        ec2_ip = "PLACEHOLDER_IP"
    
    if ec2_ip == "PLACEHOLDER_IP":
        print("WARNING: Using placeholder IP. Configuration file will be created but needs manual update.")
    
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
        print("Pipeline will continue - configuration can be updated manually.")
        print("=" * 60)
        sys.exit(0)

<<<<<<< HEAD
# Main execution block
if _name_ == '_main_':
    main()
=======
# Execute main function when script is run directly
# This avoids the __name__ issue - script will always run main()
main()
>>>>>>> d535db1 (Fix Python script, add Dockerfile, and update config files)
